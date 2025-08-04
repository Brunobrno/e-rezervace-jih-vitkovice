from rest_framework import viewsets, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse

from .models import Event, Reservation, MarketSlot, Square
from .serializers import EventSerializer, ReservationSerializer, MarketSlotSerializer, SquareSerializer
from .filters import EventFilter, ReservationFilter

from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.core.exceptions import ObjectDoesNotExist

from account.permissions import *


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
        "Správa rezervací – vytvoření, úprava a výpis. Filtrování podle eventu, statusu, uživatele atd.\n\n"
        "🔍 **Fulltextové vyhledávání (`?search=`)** prohledává:\n"
        "- název události (`event.name`)\n"
        "- název náměstí (`event.square.name`)\n"
        "- město (`event.square.city`)\n"
        "- poznámku (`note`)\n"
        "- e-mail uživatele (`user.email`)\n"
        "- jméno a příjmení uživatele (`user.first_name`, `user.last_name`)\n\n"
        "**Příklady:** `?search=jan.novak@example.com`, `?search=Velikonoční`, `?search=Ostrava`"
    )
)
class ReservationViewSet(viewsets.ModelViewSet):
    # queryset = Reservation.objects.select_related("event", "marketSlot", "user").all().order_by("-created_at")
    queryset = Reservation.objects.all().order_by("-created_at")
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
    
    def perform_create(self, serializer):
        self._check_blocked_permission(serializer.validated_data)
        serializer.save()

    def perform_update(self, serializer):
        self._check_blocked_permission(serializer.validated_data)
        serializer.save()

    def _check_blocked_permission(self, data):
        slot_id = data.get("marketSlot")

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
