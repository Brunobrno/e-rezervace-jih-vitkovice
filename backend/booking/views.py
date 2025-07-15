from rest_framework import viewsets, permissions
from rest_framework.permissions import IsAuthenticated

from .models import Event, Reservation, Cell
from .serializers import EventSerializer, ReservationSerializer, CellSerializer
from account.permissions import *

from django.contrib.auth import get_user_model

from drf_spectacular.utils import extend_schema

@extend_schema(
    tags=["Event - basic"]
)
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('start')
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated, RoleAllowed("admin", "squareManager")]

@extend_schema(
    tags=["Cell - basic"]
)
class CellViewSet(viewsets.ModelViewSet):
    queryset = Cell.objects.all().select_related("reservation", "event")
    serializer_class = CellSerializer
    permission_classes = [IsAuthenticated, RoleAllowed("admin", "squareManager")]

@extend_schema(
    tags=["Reservation - basic"]
)
class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all().select_related("event", "user")
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated, RoleAllowed("admin", "seller", "cityClerk")]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

