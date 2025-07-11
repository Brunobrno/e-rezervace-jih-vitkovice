from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, OneTimeLoginToken

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser

    list_display = (
        "username", "email", "role","create_time", "account_type", "is_active", "is_staff", "email_verified", 
    )
    list_filter = ("role", "account_type", "is_active", "is_staff", "email_verified")
    search_fields = ("username", "email", "phone_number")
    ordering = ("-create_time",)

    readonly_fields = ("create_time",)  # zde

    fieldsets = (
        (None, {"fields": ("username", "email", "password")}),
        ("Osobní údaje", {"fields": ("role", "account_type", "phone_number", "var_symbol", "bank_acc", "ICO", "city", "street", "PSC")}),
        ("Práva a stav", {"fields": ("is_active", "is_staff", "is_superuser", "email_verified", "groups", "user_permissions")}),
        ("Důležité časy", {"fields": ("last_login",)}),  # create_time vyjmuto odsud
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("username", "email", "password1", "password2", "role", "account_type", "is_active", "is_staff"),
        }),
    )



@admin.register(OneTimeLoginToken)
class OneTimeLoginTokenAdmin(admin.ModelAdmin):
    list_display = ("user", "token", "created_at", "expires_at", "used")
    list_filter = ("used", "created_at", "expires_at")
    search_fields = ("user__username", "user__email", "token")
    ordering = ("-created_at",)
