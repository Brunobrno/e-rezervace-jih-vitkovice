from django.contrib import admin
from .models import Event, Reservation, Cell

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


# @admin.register(Cell)
class CellAdmin(admin.ModelAdmin):
    list_display = ("id", "x", "y", "w", "h", "event", "reservation", "created_at")
    list_filter = ("event", "reservation")
    search_fields = ("event__name", "reservation__user__username")
    readonly_fields = ("created_at",)
    ordering = ("event", "y", "x")