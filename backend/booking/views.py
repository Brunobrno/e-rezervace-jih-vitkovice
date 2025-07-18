from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema

from .models import Event, Reservation, MarketSlot, Square
from .serializers import EventSerializer, ReservationSerializer, MarketSlotSerializer, SquareSerializer
from .filters import EventFilter, ReservationFilter

from rest_framework.permissions import IsAuthenticated
from account.permissions import *

@extend_schema(
    tags=["Square"],
    description=(
        "Správa náměstí – vytvoření, aktualizace a výpis s doplňkovými informacemi (`quarks`) "
        "a připojenými eventy. Možno filtrovat podle města, PSČ a velikosti."
    )
)
class SquareViewSet(viewsets.ModelViewSet):
    queryset = Square.objects.all().order_by("name")
    serializer_class = SquareSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ["city", "psc", "width", "height"]
    ordering_fields = ["name", "width", "height"]
    search_fields = ["name", "description", "street", "city"]

    permission_classes = [IsAuthenticated, RoleAllowed("admin", "squareManager")]


@extend_schema(
    tags=["Event"],
    description="Základní operace pro správu událostí (Event). Lze filtrovat podle času, města a velikosti náměstí."
)
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by("start")
    serializer_class = EventSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_class = EventFilter
    ordering_fields = ["start", "end", "price_per_m2"]
    search_fields = ["name", "description", "city"]

    permission_classes = [IsAuthenticated, RoleAllowed("admin", "squareManager")]


@extend_schema(
    tags=["MarketSlot"],
    description="Vytváření, aktualizace a mazání konkrétních prodejních míst pro události."
)
class MarketSlotViewSet(viewsets.ModelViewSet):
    queryset = MarketSlot.objects.select_related("event").all().order_by("event")
    serializer_class = MarketSlotSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["event", "status"]
    ordering_fields = ["price_per_m2", "x", "y"]

    permission_classes = [IsAuthenticated, RoleAllowed("admin", "squareManager", "seller")]


@extend_schema(
    tags=["Reservation"],
    description="Správa rezervací – vytvoření, úprava a výpis. Filtrování podle eventu, statusu, uživatele atd."
)
class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.select_related("event", "marketSlot", "user").all().order_by("-created_at")
    serializer_class = ReservationSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = ReservationFilter
    ordering_fields = ["reserved_from", "reserved_to", "created_at"]

    def get_queryset(self):
        qs = Reservation.objects.select_related("event", "marketSlot", "user").order_by("-created_at")
        user = self.request.user
        if hasattr(user, "role") and user.role == "seller":
            return qs.filter(user=user)
        return qs

