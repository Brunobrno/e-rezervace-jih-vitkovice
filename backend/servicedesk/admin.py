from django.contrib import admin
from .models import ServiceTicket
from trznice.admin import custom_admin_site


class ServiceTicketAdmin(admin.ModelAdmin):
    list_display = ("title", "status", "urgency", "user", "created_at", "is_deleted")
    list_filter = ("status", "urgency", "is_deleted")
    search_fields = ("title", "description", "user__username", "user__email")
    ordering = ("-created_at",)

    def get_queryset(self, request):
        # Use the all_objects manager to show even soft-deleted entries
        if request.user.role == "admin":
            qs = self.model.all_objects.select_related("user").all()
        else:
            qs = self.model.objects.select_related("user").all()
        return qs

custom_admin_site.register(ServiceTicket, ServiceTicketAdmin)