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


schema_view = get_schema_view(
   openapi.Info(
      title="Your Project API",
      default_version='v1',
      description="API documentation",
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

from .sitemaps import AutoSitemap
from django.contrib.sitemaps.views import sitemap
sitemaps = {
    'auto': AutoSitemap,
}

from .admin import custom_admin_site
urlpatterns = [
    path('login/', auth_views.LoginView.as_view(), name='login'),  # pro Swagger
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    
    # path('admin/', admin.site.urls),
    path("admin/", custom_admin_site.urls),  # override default admin

    path('account/', include('account.urls')),
    path('booking/', include('booking.urls')),

    #rest framework, map of api
    path('swagger<format>.json|.yaml', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),

    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='sitemap'),
    #path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
