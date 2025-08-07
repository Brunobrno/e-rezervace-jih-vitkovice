from django.contrib import admin
from .models import AppConfig

from trznice.admin import custom_admin_site


class AppConfigAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        # Prevent adding more than one instance
        return not AppConfig.objects.exists()

    def has_delete_permission(self, request, obj=None):
        # Prevent deletion
        return False

    readonly_fields = ('last_changed_by', 'last_changed_at',)

    def save_model(self, request, obj, form, change):
        obj.last_changed_by = request.user
        super().save_model(request, obj, form, change)

custom_admin_site.register(AppConfig, AppConfigAdmin)
