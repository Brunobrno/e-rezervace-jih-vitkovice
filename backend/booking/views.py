from rest_framework import viewsets, permissions
from rest_framework.permissions import IsAuthenticated

from .models import Event, Reservation
from .serializers import EventSerializer, ReservationSerializer
from account.permissions import *

from django.contrib.auth import get_user_model

from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample, OpenApiParameter


@extend_schema(
    tags=["Event - basic"],
    description="Basic Event requesty"
)
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('start')
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated, RoleAllowed("admin", "squareManager")]

@extend_schema(
    tags=["Reservation - basic"],
    description="Basic Reservation requesty"
)
class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all().select_related("event", "user")
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated, RoleAllowed("admin", "seller", "cityClerk")]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

