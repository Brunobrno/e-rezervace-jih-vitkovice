from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, ReservationViewSet, SquareViewSet, MarketSlotViewSet, ReservationAvailabilityCheckView, ReservedDaysView

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'reservations', ReservationViewSet, basename='reservation')
router.register(r'squares', SquareViewSet, basename='square')
router.register(r'market-slots', MarketSlotViewSet, basename='market-slot')

urlpatterns = [
    path('', include(router.urls)),
    path('reservations/check', ReservationAvailabilityCheckView.as_view(), name='event-reservation-check'),
    path('reserved-days-check/', ReservedDaysView.as_view(), name='reserved-days'),
]