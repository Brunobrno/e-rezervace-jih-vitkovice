from django.contrib import admin
from .models import Event, Reservation, MarketSlot, Square

from trznice.admin import custom_admin_site

class SquareAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "description", "street", "city", "width", "height", "is_deleted")
    list_filter = ("name", "is_deleted")
    search_fields = ("name", "description")
    ordering = ("name",)

    base_fields = ['name', 'description', 'street', 'city', 'psc', 'width', 'height', 'grid_rows', 'grid_cols', 'cellsize', 'image'] 

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

custom_admin_site.register(Square, SquareAdmin)

# @admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "square", "start", "end", "price_per_m2", "is_deleted")
    list_filter = ("start", "end", "is_deleted")
    search_fields = ("name", "description")
    ordering = ("-start",)

    base_fields = ['name', 'description', 'square', 'price_per_m2', 'start', 'end', 'image'] 

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
    
custom_admin_site.register(Event, EventAdmin)

# @admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ("id", "event", "user", "reserved_from", "reserved_to", "status", "created_at", "is_deleted")
    list_filter = ("status", "user", "event", "is_deleted")
    search_fields = ("user__username", "user__email", "event__name", "note")
    ordering = ("-created_at",)

    base_fields = ['event', 'marketSlot', 'user', 'status', 'used_extension', 'final_price', 'reserved_to', 'reserved_from', 'note'] 

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
    
custom_admin_site.register(Reservation, ReservationAdmin)


class MarketSlotAdmin(admin.ModelAdmin):
    list_display = ("id", "event", "number", "status", "base_size", "available_extension", "price_per_m2", "x", "y", "width", "height", "is_deleted")
    list_filter = ("status", "event", "is_deleted")
    search_fields = ("event__name",)
    ordering = ("event", "status")

    base_fields = ['event', 'status', 'number', 'base_size', 'available_extension', 'price_per_m2', 'width', 'height', 'x', 'y'] 

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

custom_admin_site.register(MarketSlot, MarketSlotAdmin)