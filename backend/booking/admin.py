from django.contrib import admin
from .models import Event, Reservation, MarketSlot, Square

from trznice.admin import custom_admin_site

class SquareAdmin(admin.ModelAdmin):
    list_display = ("name", "description", "street", "city", "width", "height")
    list_filter = ("name",)
    search_fields = ("name", "description")
    ordering = ("name",)

custom_admin_site.register(Square, SquareAdmin)

# @admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    exclude = ("x", "y", "w", "h", "square_size")
    list_display = ("name", "start", "end", "grid_resolution", "price_per_m2")
    list_filter = ("start", "end")
    search_fields = ("name", "description")
    ordering = ("-start",)

custom_admin_site.register(Event, EventAdmin)

# @admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ("event", "user", "reserved_from", "reserved_to", "status", "created_at")
    list_filter = ("status", "event")
    search_fields = ("user__username", "user__email", "event__name", "note")
    ordering = ("-created_at",)

custom_admin_site.register(Reservation, ReservationAdmin)


class MarketSlotAdmin(admin.ModelAdmin):
    exclude = ("number",)
    # readonly_fields = ('number',)
    list_display = ("event", "number", "status", "base_size", "available_extension", "price_per_m2", "first_x", "first_y", "second_x", "second_y")
    list_filter = ("status", "event")
    search_fields = ("event__name",)
    ordering = ("event", "status")

custom_admin_site.register(MarketSlot, MarketSlotAdmin)