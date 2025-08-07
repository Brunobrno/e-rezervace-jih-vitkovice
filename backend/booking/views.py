from rest_framework import viewsets, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse, OpenApiExample

from .models import Event, Reservation, MarketSlot, Square, ReservationCheck
from .serializers import EventSerializer, ReservationSerializer, MarketSlotSerializer, SquareSerializer, ReservationAvailabilitySerializer, ReservedDaysSerializer, ReservationCheckSerializer
from .filters import EventFilter, ReservationFilter

from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.views import APIView

from account.permissions import *

import logging

import logging

from account.tasks import send_email_verification_task


@extend_schema(
    tags=["Square"],
    description=(
        "Správa náměstí – vytvoření, aktualizace a výpis s doplňkovými informacemi (`quarks`) "
        "a připojenými eventy. Možno filtrovat podle města, PSČ a velikosti.\n\n"
        "🔍 **Fulltextové vyhledávání (`?search=`)** prohledává následující pole:\n"
        "- název náměstí (`name`)\n"
        "- popis (`description`)\n"
        "- ulice (`street`)\n"
        "- město (`city`)\n\n"
        "**Příklady:** `?search=Ostrava`, `?search=Hlavní třída`"
    )
)
class SquareViewSet(viewsets.ModelViewSet):
    queryset = Square.objects.prefetch_related("square_events").all().order_by("name")
    serializer_class = SquareSerializer
    parser_classes = [MultiPartParser, FormParser]  # Accept image uploads
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ["city", "psc", "width", "height"]
    ordering_fields = ["name", "width", "height"]
    search_fields = [
        "name",         # název náměstí
        "description",  # popis
        "street",       # ulice
        "city",         # město
        # "psc" je číslo, obvykle do search_fields nepatří, ale můžeš ho filtrovat přes filterset_fields
    ]

    permission_classes = [RoleAllowed("admin", "squareManager")]

    def get_queryset(self):
        send_email_verification_task.delay(1)
        return super().get_queryset()
    


@extend_schema(
    tags=["Event"],
    description=(
        "Základní operace pro správu událostí (Event). Lze filtrovat podle času, města a velikosti náměstí.\n\n"
        "🔍 **Fulltextové vyhledávání (`?search=`)** prohledává:\n"
        "- název události (`name`)\n"
        "- popis (`description`)\n"
        "- název náměstí (`square.name`)\n"
        "- město (`square.city`)\n"
        "- popis náměstí (`square.description`)\n"
        "- ulice (`square.street`)\n\n"
        "**Příklady:** `?search=Jarmark`, `?search=Ostrava`, `?search=Masarykovo`"
    )
)
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.prefetch_related("event_marketSlots", "event_products").all().order_by("start")
    serializer_class = EventSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_class = EventFilter
    ordering_fields = ["start", "end", "price_per_m2"]
    search_fields = [
        "name",                       # název události
        "description",                # popis události
        "square__name",              # název náměstí
        "square__city",              # město
        "square__description",       # popis náměstí (volitelný)
        "square__street",            # ulice
    ]

    permission_classes = [RoleAllowed("admin", "squareManager")]


@extend_schema(
    tags=["MarketSlot"],
    description="Vytváření, aktualizace a mazání konkrétních prodejních míst pro události."
)
class MarketSlotViewSet(viewsets.ModelViewSet):
    # queryset = MarketSlot.objects.select_related("event").all().order_by("event")
    queryset = MarketSlot.objects.all().order_by("event")
    serializer_class = MarketSlotSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["event", "status"]
    ordering_fields = ["price_per_m2", "x", "y"]

    permission_classes = [RoleAllowed("admin", "squareManager")]


@extend_schema(
    tags=["Reservation"],
    description=(
        "Správa rezervací – vytvoření, úprava a výpis. Filtrování podle eventu, statusu, uživatele atd."
    )
)
class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = ReservationFilter
    ordering_fields = ["reserved_from", "reserved_to", "created_at"]
    search_fields = [
        "event__name",
        "event__square__name",
        "event__square__city",
        "note",
        "user__email",
        "user__first_name",
        "user__last_name",
    ]
    permission_classes = [RoleAllowed("admin", "squareManager", "seller")]

    def get_queryset(self):
        # queryset = Reservation.objects.select_related("event", "marketSlot", "user").prefetch_related("event_products").order_by("-created_at")
        queryset = Reservation.objects.all().order_by("-created_at")
        user = self.request.user
        if hasattr(user, "role") and user.role == "seller":
            return queryset.filter(user=user)
        return queryset

    # Optionally, override create() to add logging or debug info
    def create(self, request, *args, **kwargs):
        logger = logging.getLogger(__name__)
        logger.debug(f"Reservation create POST data: {request.data}")
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error in ReservationViewSet.create: {e}", exc_info=True)
            raise
    
    def perform_create(self, serializer):
        self._check_blocked_permission(serializer.validated_data)
        serializer.save()

    def perform_update(self, serializer):
        self._check_blocked_permission(serializer.validated_data)
        serializer.save()

    def _check_blocked_permission(self, data):
        # FIX: Always get the MarketSlot instance, not just the ID
        # Accept both "market_slot" (object or int) and "marketSlot" (legacy)
        slot = data.get("market_slot") or data.get("marketSlot")

        # If slot is a MarketSlot instance, get its id
        if hasattr(slot, "id"):
            slot_id = slot.id
        else:
            slot_id = slot

        if not isinstance(slot_id, int):
            raise PermissionDenied("Neplatné ID prodejního místa.")

        try:
            market_slot = MarketSlot.objects.get(pk=slot_id)
        except ObjectDoesNotExist:
            raise PermissionDenied("Prodejní místo nebylo nalezeno.")

        if market_slot.status == "blocked":
            user = self.request.user
            if getattr(user, "role", None) not in ["admin", "clerk"]:
                raise PermissionDenied("Toto prodejní místo je zablokované.")

@extend_schema(
    tags=["Reservation"],
    summary="Check reservation availability",
    request=ReservationAvailabilitySerializer,
    responses={200: OpenApiExample(
        'Availability Response',
        value={"available": True},
        response_only=True
    )}
)
class ReservationAvailabilityCheckView(APIView):
    def post(self, request):
        serializer = ReservationAvailabilitySerializer(data=request.data)
        if serializer.is_valid():
            return Response({"available": True}, status=status.HTTP_200_OK)
        return Response({"available": False}, status=status.HTTP_200_OK)

logger = logging.getLogger(__name__)

@extend_schema(
    tags=["Reservation"],
    summary="Get reserved days for a market slot in an event",
    description=(
        "Returns a list of reserved days for a given event and market slot. "
        "Useful for visualizing slot occupancy and preventing double bookings. "
        "Provide `event_id` and `market_slot_id` as query parameters."
    ),
    parameters=[
        OpenApiParameter(
            name="market_slot_id",
            type=int,
            location=OpenApiParameter.QUERY,
            required=True,
            description="ID of the market slot"
        ),
    ],
    responses={200: ReservedDaysSerializer}
)
class ReservedDaysView(APIView):
    """
    Returns reserved days for a given event and market slot.
    GET params: event_id, market_slot_id
    """
    def get(self, request, *args, **kwargs):
        market_slot_id = request.query_params.get("market_slot_id")
        if not market_slot_id:
            return Response(
                {"detail": "market_slot_id is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = ReservedDaysSerializer({
            "market_slot_id": market_slot_id
        })
        logger.debug(f"ReservedDaysView GET market_slot_id={market_slot_id}")
        return Response(serializer.data)
    


@extend_schema(
    tags=["Reservation Checks"],
    description="Správa kontrol rezervací – vytváření záznamů o kontrole a jejich výpis."
)
class ReservationCheckViewSet(viewsets.ModelViewSet):
    queryset = ReservationCheck.objects.select_related("reservation", "checker").all().order_by("-checked_at")
    serializer_class = ReservationCheckSerializer
    permission_classes = [OnlyRolesAllowed("admin", "checker")]  # Only checkers & admins can use it

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, "role") and user.role == "checker":
            return self.queryset.filter(checker=user)  # Checkers only see their own logs
        return self.queryset

    def perform_create(self, serializer):
        serializer.save()