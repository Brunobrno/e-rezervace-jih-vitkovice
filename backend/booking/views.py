from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema

from .models import Event, Reservation, MarketSlot
from .serializers import EventSerializer, ReservationSerializer, MarketSlotSerializer
from .filters import EventFilter, ReservationFilter


@extend_schema(
    tags=["Event – správa"],
    description="Základní operace pro správu událostí (Event). Lze filtrovat podle času, města a velikosti náměstí."
)
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by("start")
    serializer_class = EventSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_class = EventFilter
    ordering_fields = ["start", "end", "price_per_m2"]
    search_fields = ["name", "description", "city"]


@extend_schema(
    tags=["MarketSlot – prodejní místa"],
    description="Vytváření, aktualizace a mazání konkrétních prodejních míst pro události."
)
class MarketSlotViewSet(viewsets.ModelViewSet):
    queryset = MarketSlot.objects.select_related("event").all().order_by("event")
    serializer_class = MarketSlotSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["event", "status"]
    ordering_fields = ["price_per_m2", "first_x", "first_y"]


@extend_schema(
    tags=["Reservation – rezervace"],
    description="Správa rezervací – vytvoření, úprava a výpis. Filtrování podle eventu, statusu, uživatele atd."
)
class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.select_related("event", "marketSlot", "user").all().order_by("-created_at")
    serializer_class = ReservationSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = ReservationFilter
    ordering_fields = ["reserved_from", "reserved_to", "created_at"]

