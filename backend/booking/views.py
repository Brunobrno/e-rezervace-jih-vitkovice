from rest_framework import viewsets
from account.permissions import *
from .models import Event, Cell, Reservation
from .serializers import EventSerializer, CellSerializer, ReservationSerializer

# 1. Akce
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    permission_classes = [IsOfficerOrReservationManager, IsSeller, IsOfficer, IsAdmin]

# 2. Buňky
class CellViewSet(viewsets.ModelViewSet):
    queryset = Cell.objects.all()
    serializer_class = CellSerializer

    permission_classes = [IsOfficerOrReservationManager, IsSeller, IsOfficer, IsAdmin]

# 3. Rezervace
class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer

    permission_classes = [IsOfficerOrReservationManager, IsSeller, IsOfficer, IsAdmin]