from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'users', UserView, basename='user')

urlpatterns = [
    path('', include(router.urls)),  # automaticky přidá všechny cesty z viewsetu

    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), #přihlášení
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    #potom co access token vyprší tak se pomocí refresh tokenu získa další
    
    path('user/registration/', UserRegistrationViewSet.as_view({'post': 'create'}), name='create_seller'),
    path('user/activation-varsymbol', UserActivationViewSet.as_view({'patch': 'partial_update'}), name='activate_user_and_input_var_symbol'),

    path("user/reset-password/", PasswordResetRequestView.as_view(), name="reset-password-request"),
    path("user/reset-password/<uidb64>/<token>/", PasswordResetConfirmView.as_view(), name="reset-password-confirm"),
]