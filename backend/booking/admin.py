from django.contrib import admin
from .models import Event, Reservation, MarketSlot, Square

from trznice.admin import custom_admin_site

class SquareAdmin(admin.ModelAdmin):
    list_display = ("name", "description", "street", "city", "width", "height", "is_deleted")
    list_filter = ("name", "is_deleted")
    search_fields = ("name", "description")
    ordering = ("name",)

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
    list_display = ("name", "square", "start", "end", "price_per_m2", "is_deleted")
    list_filter = ("start", "end", "is_deleted")
    search_fields = ("name", "description")
    ordering = ("-start",)

    def get_queryset(self, request):
        # Use the all_objects manager to show even soft-deleted entries
        if request.user.role == "admin":
            qs = self.model.all_objects.select_related("square").all()
        else:
            qs = self.model.objects.select_related("square").all()
        return qs
    
custom_admin_site.register(Event, EventAdmin)

# @admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ("event", "user", "reserved_from", "reserved_to", "status", "created_at", "is_deleted")
    list_filter = ("status", "user", "event", "is_deleted")
    search_fields = ("user__username", "user__email", "event__name", "note")
    ordering = ("-created_at",)

    def get_queryset(self, request):
        # Use the all_objects manager to show even soft-deleted entries
        if request.user.role == "admin":
            qs = self.model.all_objects.select_related("event", "user").all()
        else:
            qs = self.model.objects.select_related("event", "user").all()
        return qs
    
custom_admin_site.register(Reservation, ReservationAdmin)


class MarketSlotAdmin(admin.ModelAdmin):
    list_display = ("event", "number", "status", "base_size", "available_extension", "price_per_m2", "x", "y", "width", "height", "is_deleted")
    list_filter = ("status", "event", "is_deleted")
    search_fields = ("event__name",)
    ordering = ("event", "status")

    def get_queryset(self, request):
        # Use the all_objects manager to show even soft-deleted entries
        if request.user.role == "admin":
            qs = self.model.all_objects.select_related("event").all()
        else:
            qs = self.model.objects.select_related("event").all()
        return qs

custom_admin_site.register(MarketSlot, MarketSlotAdmin)