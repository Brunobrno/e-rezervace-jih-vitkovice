from django.contrib import admin

from trznice.admin import custom_admin_site
from .models import Order

class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "order_number", "status", "user", "price_to_pay", "reservation", "is_deleted")
    list_filter = ("user", "status", "reservation", "is_deleted")
    search_fields = ("order_number", "user__email", "reservation__event")
    ordering = ("id",)

    base_fields = ["order_number", "status", "reservation", "created_at", "user", "price_to_pay", "payed_at", "note"] 
    
    readonly_fields = ("id", "order_number", "created_at", "payed_at")
    
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
    
custom_admin_site.register(Order, OrderAdmin)