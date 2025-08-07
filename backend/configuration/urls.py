from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AppConfigViewSet

router = DefaultRouter()
router.register(r'', AppConfigViewSet, basename='app_config')


urlpatterns = [
    path('', include(router.urls)),
]