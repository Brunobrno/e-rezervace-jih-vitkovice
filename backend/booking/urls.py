from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, ReservationViewSet, SquareViewSet, MarketSlotViewSet

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'reservations', ReservationViewSet, basename='reservation')
router.register(r'squares', SquareViewSet, basename='square')
router.register(r'market-slots', MarketSlotViewSet, basename='market-slot')

urlpatterns = [
    path('', include(router.urls)),
]