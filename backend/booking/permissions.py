from rest_framework.permissions import BasePermission, SAFE_METHODS

class RoleBasedPermissionAdminSqManager(BasePermission):
    """
    Allow:
      - All SAFE_METHODS to anyone authenticated
      - Write methods only to admin, officer, or reservation manager
    """

    def has_permission(self, request, view):
        user = request.user

        # Always allow safe (read-only) methods to authenticated users
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated

        # Write permissions only for selected roles
        if hasattr(user, "role") and user.role in ["admin", "squareManager"]:
            return True

        return False


class RoleBasedPermissionReservationView(BasePermission):
    """
    Allow:
      - All SAFE_METHODS to anyone authenticated
      - Write methods only to admin, officer, or reservation manager
    """

    def has_permission(self, request, view):
        user = request.user

        # Always allow safe (read-only) methods to authenticated users
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated

        # Write permissions only for selected roles
        if hasattr(user, "role") and user.role in ["admin", "seller", "cityClerk"]:
            return True

        return False
