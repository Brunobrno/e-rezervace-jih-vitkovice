from django.contrib import admin
from .models import Event, Area, Reservation, Space

from trznice.admin import custom_admin_site

# @admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("name", "start", "end", "grid_resolution", "price_per_m2")
    list_filter = ("start", "end")
    search_fields = ("name", "description")
    ordering = ("-start",)

custom_admin_site.register(Event, EventAdmin)

# @admin.register(Area)
class AreaAdmin(admin.ModelAdmin):
    list_display = ("event", "x", "y", "w", "h", "available")
    list_filter = ("available", "event")
    search_fields = ("event__name",)
    ordering = ("event", "x", "y")

custom_admin_site.register(Area, AreaAdmin)

# @admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ("event", "user", "reserved_from", "reserved_to", "status", "created_at")
    list_filter = ("status", "event")
    search_fields = ("user__username", "user__email", "event__name", "note")
    ordering = ("-created_at",)

custom_admin_site.register(Reservation, ReservationAdmin)

# @admin.register(Space)
class SpaceAdmin(admin.ModelAdmin):
    list_display = ("area", "x", "y", "w", "h", "reservation", "created_at")
    list_filter = ("area",)
    search_fields = ("area__event__name", "reservation__user__username")
    ordering = ("-created_at",)

custom_admin_site.register(Space, SpaceAdmin)