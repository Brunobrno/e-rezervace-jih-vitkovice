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
            "squareManager": ["Square", "Event", "MarketSlot", "Product", "EventProduct"],
            "cityClerk": ["CustomUser", "Event", "MarketSlot", "Reservation", "Product", "EventProduct", "ServiceTicket"],
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

    # def get_app_list(self, request):
    #     app_dict = self._build_app_dict(request)

    #     # Return custom ordered app/model list
    #     return [
    #         {
    #             'name': 'Account',
    #             'app_label': 'your_app_name',
    #             'models': [
    #                 app_dict['your_app_name']['models_dict']['User'],
    #             ],
    #         },
    #         {
    #             'name': 'Booking',
    #             'app_label': 'your_app_name',
    #             'models': [
    #                 app_dict['your_app_name']['models_dict']['Event'],
    #                 app_dict['your_app_name']['models_dict']['MarketSlot'],
    #                 app_dict['your_app_name']['models_dict']['Reservation'],
    #                 app_dict['your_app_name']['models_dict']['Square'],
    #             ],
    #         },
    #         {
    #             'name': 'Product',
    #             'app_label': 'your_app_name',
    #             'models': [
    #                 app_dict['your_app_name']['models_dict']['EventProduct'],
    #                 app_dict['your_app_name']['models_dict']['Product'],
    #             ],
    #         },
    #     ]

# Initialize the custom admin site
custom_admin_site = RoleBasedAdminSite(name='custom_admin')

# # Register your models to the custom admin site
# custom_admin_site.register(Event)
# custom_admin_site.register(Reservation)
# custom_admin_site.register(Space)
