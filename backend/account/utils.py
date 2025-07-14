from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from booking.models import Event, Reservation, Space
from booking.models import Event, Reservation, Space
from django.contrib.auth import get_user_model


def assign_permissions_based_on_role(user):
    role_perms = {
        "cityClerk": {
            "view": [Event, Reservation, get_user_model()],
            "add": [Reservation, get_user_model()],
            "change": [Reservation, get_user_model()],
            "delete": [Reservation],
        },
        "squareManager": {
            "view": [Event, Area, Space],
            "add": [Event, Area, Space],
            "change": [Event, Area, Space],
        },
        # "admin": {
        #     "view": [Event, Area, Reservation, Space, get_user_model()],
        #     "add": [Event, Area, Reservation, Space],
        #     "change": [Event, Area, Reservation, Space],
        #     "delete": [Event, Area, Reservation, Space],
        # },
        # etc.
            "admin": "all",  # Mark this role specially
    }

    if not user.role:
        return

    if user.role == "admin":
        user.is_staff = True
        user.is_superuser = True
        user.save()
        return

    # Reset in case role changed away from admin
    user.is_superuser = False


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