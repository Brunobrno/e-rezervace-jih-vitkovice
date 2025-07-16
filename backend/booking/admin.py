from django.contrib import admin
from .models import Event, Reservation, MarketSlot

from trznice.admin import custom_admin_site

# @admin.register(Event)
class EventAdmin(admin.ModelAdmin):
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
    list_display = ("event", "status", "avilabe_extension", "price", "first_x", "first_y", "second_x", "second_y")
    list_filter = ("status", "event")
    search_fields = ("event__name",)
    ordering = ("event", "status")

custom_admin_site.register(MarketSlot, MarketSlotAdmin)