from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *


router = DefaultRouter()
router.register(r'user', UserView, basename='user')

urlpatterns = [
    path('', include(router.urls)),  # automaticky přidá všechny cesty z viewsetu
    path("user/me/", CurrentUserView.as_view(), name="user-me"), # get current user data

    path('token/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'), #přihlášení (get token)
    path('token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'), #refresh token
    #potom co access token vyprší tak se pomocí refresh tokenu získa další

    path('logout/', LogoutView.as_view(), name='logout'),  # odhlášení (smaže tokeny)
    
    path('registration/', UserRegistrationViewSet.as_view({'post': 'create'}), name='create_seller'),

    #slouží čistě pro email 
    path("registration/verify-email/<uidb64>/<token>/", EmailVerificationView.as_view(), name="verify-email"),
    
    path("registration/activation-varsymbol/", UserActivationViewSet.as_view(), name="activate_user_and_input_var_symbol"),

    path("reset-password/", PasswordResetRequestView.as_view(), name="reset-password-request"),
    path("reset-password/<uidb64>/<token>/", PasswordResetConfirmView.as_view(), name="reset-password-confirm"),
]