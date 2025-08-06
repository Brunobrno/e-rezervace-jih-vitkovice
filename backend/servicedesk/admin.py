from django.contrib import admin
from .models import ServiceTicket
from trznice.admin import custom_admin_site


class ServiceTicketAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "status", "user", "created_at", "is_deleted")
    list_filter = ("status", "is_deleted")
    search_fields = ("title", "description", "user__username", "user__email")
    ordering = ("-created_at",)

    readonly_fields = ['created_at']
    base_fields = ['title', 'category', 'description', 'user', 'status', 'created_at']


    def get_fields(self, request, obj=None):
        fields = self.base_fields.copy()
        if request.user.role == "admin":
            fields += ['is_deleted', 'deleted_at']
        return fields
    
    def get_queryset(self, request):
        # Use the all_objects manager to show even soft-deleted entries
        if request.user.role == "admin":
            qs = self.model.all_objects.all()
        else:
            qs = self.model.objects.all()
        return qs

custom_admin_site.register(ServiceTicket, ServiceTicketAdmin)