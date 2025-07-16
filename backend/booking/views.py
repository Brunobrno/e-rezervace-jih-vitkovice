from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema

from .models import Event, Reservation
from .serializers import EventSerializer, ReservationSerializer
from .filters import EventFilter


@extend_schema(
    tags=["Event - základní"],
    description="Základní operace pro správu eventů (událostí)."
)
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by("start")
    serializer_class = EventSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_class = EventFilter
    ordering_fields = ["start", "end", "price_per_m2"]
    search_fields = ["name", "description", "city"]


@extend_schema(
    tags=["Reservation - basic"],
    description="Basic Reservation requesty – vytvoření, výpis, mazání a úprava rezervací."
)
class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all().select_related("event", "marketSlot", "user").order_by("-created_at")
    serializer_class = ReservationSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["event", "status", "user"]
    ordering_fields = ["reserved_from", "reserved_to", "created_at"]


