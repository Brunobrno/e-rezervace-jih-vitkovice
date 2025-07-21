from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework.permissions import IsAuthenticated
from rest_framework_api_key.permissions import HasAPIKey


#Podle svého uvážení (NEPOUŽÍVAT!!!)
class RolePermission(BasePermission):
    allowed_roles = []

    def has_permission(self, request, view):
        # Je uživatel přihlášený a má roli z povolených?
        user_has_role = (
            request.user and
            request.user.is_authenticated and
            getattr(request.user, "role", None) in self.allowed_roles
        )

        # Má API klíč?
        has_api_key = HasAPIKey().has_permission(request, view)


        return user_has_role or has_api_key


#TOHLE POUŽÍT!!!
#Prostě stačí vložit: RoleAllowed('seller','cityClerk')
def RoleAllowed(*roles):
    class SafeOrRolePermission(BasePermission):
        """
        Allows safe methods for any authenticated user.
        Allows unsafe methods only for users with specific roles.

        Args:
            RolerAllowed('seller', 'cityClerk')
        """

        def has_permission(self, request, view):
            # Allow safe methods for any authenticated user
            if request.method in SAFE_METHODS:
                return IsAuthenticated().has_permission(request, view)

            # Otherwise, check the user's role
            user = request.user
            return user and user.is_authenticated and getattr(user, "role", None) in roles

    return SafeOrRolePermission



# For Settings.py
class AdminOnly(BasePermission):
    """ Allows access only to users with the 'admin' role.

    Args:
        BasePermission (rest_framework.permissions.BasePermission): Base class for permission classes.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and getattr(request.user, 'role', None) == 'admin'