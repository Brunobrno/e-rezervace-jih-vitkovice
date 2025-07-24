from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, EventProductViewSet


router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='products')
router.register(r'event-products', EventProductViewSet, basename='event-products')

urlpatterns = [
    path('', include(router.urls)),
]