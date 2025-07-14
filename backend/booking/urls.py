from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, ReservationViewSet, CellViewSet

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'cells', CellViewSet, basename='cell')
router.register(r'reservations', ReservationViewSet, basename='reservation')

urlpatterns = [
    path('', include(router.urls)),
]