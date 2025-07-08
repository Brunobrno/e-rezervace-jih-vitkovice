from django.urls import path, include
from rest_framework.routers import DefaultRouter
from views import *

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'), #registrace uživatele
    path('me/', UserDetailView.as_view(), name='user-detail'), #kdo jsem?

    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), #přihlášení
    
    

    
    

    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    #potom co access token vyprší tak se pomocí refresh tokenu získa další
    

    path('office/create-user-with-token/', CreateUserWithTokenView.as_view(), name='create_user_with_token'),
    path('auth/login-with-token/', OneTimeLoginView.as_view(), name='login_with_token'),
]