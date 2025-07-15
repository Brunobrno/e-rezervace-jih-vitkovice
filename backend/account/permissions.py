from rest_framework.permissions import BasePermission
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
    class CustomRolePermission(RolePermission):
        allowed_roles = roles
    return CustomRolePermission