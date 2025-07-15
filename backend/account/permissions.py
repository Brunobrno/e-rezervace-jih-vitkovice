from rest_framework.permissions import BasePermission




class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin' and request.user.is_superuser

class IsOfficer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'cityClerk'

class IsReservationManager(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'squareManager'

class IsOfficerOrReservationManager(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['cityClerk', 'checker']

class IsSeller(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['seller']

class IsPublic(BasePermission):
    """Pouze pro nepřihlášené uživatele."""
    def has_permission(self, request, view):
        return not request.user.is_authenticated


#Podle svého uvážení
class RolePermission(BasePermission):
    allowed_roles = []

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            getattr(request.user, "role", None) in self.allowed_roles
        )

#Prostě stačí vložit RoleAllowed('seller','cityClerk')
def RoleAllowed(*roles):
    class CustomRolePermission(RolePermission):
        allowed_roles = roles
    return CustomRolePermission