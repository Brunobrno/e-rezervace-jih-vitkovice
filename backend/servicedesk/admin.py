from django.contrib import admin
from .models import ServiceTicket
from trznice.admin import custom_admin_site


class ServiceTicketAdmin(admin.ModelAdmin):
    list_display = ("title", "status", "urgency", "user", "created_at")
    list_filter = ("status", "urgency")
    search_fields = ("title", "description", "user__username", "user__email")
    ordering = ("-created_at",)

custom_admin_site.register(ServiceTicket, ServiceTicketAdmin)