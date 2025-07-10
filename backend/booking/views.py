from rest_framework import viewsets, permissions
from .models import Event, Area, Reservation, Space
from .serializers import EventSerializer, AreaSerializer, ReservationSerializer, SpaceSerializer
from ..account.permissions import *

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated, IsOfficer]


class AreaViewSet(viewsets.ModelViewSet):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer
    permission_classes = [IsAuthenticated, IsReservationManager]


class SpaceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Space.objects.all().select_related("reservation", "area")
    serializer_class = SpaceSerializer
    permission_classes = [permissions.AllowAny]  # veřejně čitelný grid


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all().select_related("event", "user")
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated, IsSeller | IsOfficer | IsAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.role in ["cityClerk", "admin", "squareManager"]:
            return self.queryset
        return self.queryset.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
