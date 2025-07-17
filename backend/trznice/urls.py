"""
URL configuration for trznice project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views

from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from . import views

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

from .admin import custom_admin_site


urlpatterns = [

    path('login/', auth_views.LoginView.as_view(), name='login'),  # pro Swagger
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    
    # path('admin/', admin.site.urls),
    path("admin/", custom_admin_site.urls),  # override default admin

    path('api/account/', include('account.urls')),
    path('api/booking/', include('booking.urls')),
    path('api/product/', include('product.urls')),

    #rest framework, map of api
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("swagger/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),

    path('', views.index, name='index'),
    path('test/email', views.test_mail, name='test-email')
]
