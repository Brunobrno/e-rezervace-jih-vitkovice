from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, CalculateReservationPriceView

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
    path("calculate_price/", CalculateReservationPriceView.as_view(), name="calculate_price"),
]