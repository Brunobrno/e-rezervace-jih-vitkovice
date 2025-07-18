from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser
from trznice.admin import custom_admin_site
from django.core.exceptions import PermissionDenied
from .forms import CustomUserCreationForm
from django.db.models import Q


# @admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    add_form = CustomUserCreationForm
    
    list_display = (
        "id", "username", "email", "role","create_time", "account_type", "is_active", "is_staff", "email_verified", 
    )
    list_filter = ("role", "account_type", "is_active", "is_staff", "email_verified")
    search_fields = ("username", "email", "phone_number")
    ordering = ("-create_time",)

    readonly_fields = ("create_time",)  # zde

    fieldsets = (
        (None, {"fields": ("username", "email", "password")}),
        ("Osobní údaje", {"fields": ("role", "account_type", "phone_number", "var_symbol", "bank_account", "ICO", "city", "street", "PSC")}),
        ("Práva a stav", {"fields": ("is_active", "is_staff", "is_superuser", "email_verified", "groups", "user_permissions")}),
        ("Důležité časy", {"fields": ("last_login",)}),  # create_time vyjmuto odsud
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "username", "email", "role", "account_type",
                "password1", "password2",  # ✅ REQUIRED!
            ),
        }),
    )    

    def get_form(self, request, obj=None, **kwargs):
        if not obj and getattr(request.user, "role", None) == "cityClerk":
            form = CustomUserCreationForm

            # Modify choices of the role field in the form class itself
            form.base_fields["role"].choices = [
                ("", "---------"),
                ("seller", "Prodejce"),
            ]

            return form

        return super().get_form(request, obj, **kwargs)

    def formfield_for_choice_field(self, db_field, request, **kwargs):
        if db_field.name == "role" and request.user.role == "cityClerk":
            # Restrict choices to only blank and "seller"
            kwargs["choices"] = [
                ("", "---------"),
                ("seller", "Prodejce"),
            ]
        return super().formfield_for_choice_field(db_field, request, **kwargs)

    def get_list_display(self, request):
        if request.user.role == "cityClerk":
            return ("email", "username", "role", "account_type", "email_verified")  # Keep it minimal
        return super().get_list_display(request)

    def get_fieldsets(self, request, obj=None):
        # "add" view = creating a new user
        if obj is None and request.user.role == "cityClerk":
            return (
                (None, {
                    "classes": ("wide",),
                    "fields": ("username", "email", "role", "account_type", "password1", "password2"),
                }),
            )
        
        # "change" view
        if request.user.role == "cityClerk":
            return (
                (None, {"fields": ("email", "username", "password")}),
                ("Osobní údaje", {"fields": ("role", "account_type", "phone_number", "var_symbol", "bank_account", "ICO", "city", "street", "PSC")}),
            )
        
        # Default for other users
        return super().get_fieldsets(request, obj)
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.role == "cityClerk":
            return qs.filter(
                Q(role__in=["seller", ""]) |  (Q(role__isnull=True)) & Q(is_superuser=False))
        return qs
    

    def save_model(self, request, obj, form, change):
        if request.user.role == "cityClerk":
            if obj.role not in ["", None, "seller"]:
                raise PermissionDenied("City clerk can't assign this role.")
        super().save_model(request, obj, form, change)

custom_admin_site.register(CustomUser, CustomUserAdmin)