from django.contrib import admin
from trznice.admin import custom_admin_site
from .models import Product, EventProduct


class ProductAdmin(admin.ModelAdmin):
    base_list_display = ("id", "name", "code")
    admin_extra_display = ("is_deleted",)
    list_filter = ("name", "is_deleted")
    search_fields = ("name", "code")
    ordering = ("name",)

    fields = ['name', 'code']

    def get_queryset(self, request):
        # Use the all_objects manager to show even soft-deleted entries
        if request.user.role == "admin":
            qs = self.model.all_objects.all()
            self.fields += ['is_deleted', 'deleted_at']
        else:
            qs = self.model.objects.all()
        return qs
    
    def get_list_display(self, request):
        if request.user.role == "admin":
            return self.base_list_display + self.admin_extra_display
        return self.base_list_display
    
custom_admin_site.register(Product, ProductAdmin)


class EventProductAdmin(admin.ModelAdmin):
    list_display = ("id", "event", "product", "start_selling_date", "end_selling_date", "is_deleted")
    list_filter = ("event", "product", "start_selling_date", "end_selling_date", "is_deleted")
    search_fields = ("product__name", "event__name")
    ordering = ("-start_selling_date",)

    fieds = ['product', 'event', 'start_selling_date', 'end_selling_date']

    def get_queryset(self, request):
        # Use the all_objects manager to show even soft-deleted entries
        if request.user.role == "admin":
            qs = self.model.all_objects.all()
            self.fields += ['is_deleted', 'deleted_at']
        else:
            qs = self.model.objects.all()
        return qs

custom_admin_site.register(EventProduct, EventProductAdmin)