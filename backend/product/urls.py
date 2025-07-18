from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, EventProductViewSet


router = DefaultRouter()
router.register(r'', ProductViewSet, basename='product')
router.register(r'event-product', EventProductViewSet, basename='eventProduct')

urlpatterns = [
    path('', include(router.urls)),
]