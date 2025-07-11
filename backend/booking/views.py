from rest_framework import viewsets, permissions
from rest_framework.permissions import IsAuthenticated

from .models import Event, Area, Reservation, Space
from .serializers import EventSerializer, AreaSerializer, ReservationSerializer, SpaceSerializer
from account.permissions import *
from .permissions import RoleBasedPermissionAdminSqManager, RoleBasedPermissionReservationView

from django.contrib.auth import get_user_model

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermissionAdminSqManager]


class AreaViewSet(viewsets.ModelViewSet):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermissionAdminSqManager]


class SpaceViewSet(viewsets.ModelViewSet):
    queryset = Space.objects.all().select_related("reservation", "area")
    serializer_class = SpaceSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermissionAdminSqManager]


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all().select_related("event", "user")
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermissionReservationView]

    # def get_queryset(self):
    #     if getattr(self, 'swagger_fake_view', False):
    #         return Reservation.objects.none()

    #     user = self.request.user

    #     # ⚠️ AnonymousUser fallback při nedefinované roli
    #     if not hasattr(user, "role"):
    #         return Reservation.objects.none()

    #     if user.role in ["cityClerk", "admin", "squareManager"]:
    #         return self.queryset
    #     return self.queryset.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

