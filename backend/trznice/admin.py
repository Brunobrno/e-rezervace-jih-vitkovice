from django.contrib.admin import AdminSite
from django.contrib import admin
# from booking.models import Event, Reservation, Space  # add all your models here


class RoleBasedAdminSite(AdminSite):
    site_header = "Tržiště Admin"
    site_title = "Tržiště Admin"
    index_title = "Přehled"

    def get_app_list(self, request):
        app_list = super().get_app_list(request)

        if not hasattr(request.user, "role"):
            return []

        role = request.user.role

        # define allowed models per role
        role_model_access = {
            "squareManager": ["Event", "MarketSlot", "Product", "EventProduct"],
            "cityClerk": ["CustomUser", "Event", "MarketSlot", "Reservation", "Product", "EventProduct"],
            # admin will see everything
        }

        # only restrict if user has limited access
        if role in role_model_access:
            allowed = role_model_access[role]

            for app in app_list:
                app["models"] = [
                    model for model in app["models"]
                    if model["object_name"] in allowed
                ]

        return app_list


# Initialize the custom admin site
custom_admin_site = RoleBasedAdminSite(name='custom_admin')

# # Register your models to the custom admin site
# custom_admin_site.register(Event)
# custom_admin_site.register(Reservation)
# custom_admin_site.register(Space)
