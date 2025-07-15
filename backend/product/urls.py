from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'', ProductViewSet, basename='product')
router.register(r'event-product', EventProductViewSet, basename='eventProduct')

urlpatterns = [
    path('', include(router.urls)),  # automaticky přidá všechny cesty z viewsetu
]