from django.contrib import admin
from trznice.admin import custom_admin_site
from .models import Product, EventProduct


class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "code")
    search_fields = ("name", "code")
    ordering = ("name",)

custom_admin_site.register(Product, ProductAdmin)


class EventProductAdmin(admin.ModelAdmin):
    list_display = ("event", "product", "start_selling_date", "end_selling_date")
    list_filter = ("start_selling_date", "end_selling_date", "event", "product")
    search_fields = ("product__name", "event__name")
    ordering = ("-start_selling_date",)

custom_admin_site.register(EventProduct, EventProductAdmin)