from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from booking.models import Event, Area, Reservation, Space
from django.contrib.auth import get_user_model


def assign_permissions_based_on_role(user):
    role_perms = {
        "cityClerk": {
            "view": [Event, Reservation, get_user_model()],
            "change": [Reservation],
        },
        "squareManager": {
            "view": [Event, Area, Space],
            "change": [Event, Area],
        },
        "admin": {
            "view": [Event, Area, Reservation, Space, get_user_model()],
            "add": [Event, Area, Reservation, Space],
            "change": [Event, Area, Reservation, Space],
            "delete": [Event, Area, Reservation, Space],
        },
        # etc.
    }

    if not user.role:
        return

    perms_for_role = role_perms.get(user.role, {})

    for action, models in perms_for_role.items():
        for model in models:
            content_type = ContentType.objects.get_for_model(model)
            codename = f"{action}_{model._meta.model_name}"
            try:
                permission = Permission.objects.get(codename=codename, content_type=content_type)
                user.user_permissions.add(permission)
            except Permission.DoesNotExist:
                # You may log this
                pass