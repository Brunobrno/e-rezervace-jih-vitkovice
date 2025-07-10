# permissions.py
from rest_framework.permissions import BasePermission

'''
class IsRoleAllowed(BasePermission):
    """
    Custom permission to allow access only to users with
    specific roles.

    Assumes your User model has a 'role' attribute.
    """

    allowed_roles = ['office_worker', 'admin']  # roles allowed to access the API

    def has_permission(self, request):
        # Check if user is authenticated and role is allowed
        user = request.user
        return bool(user and user.is_authenticated and user.role in self.allowed_roles)'''
    



class IsAuthenticated(BasePermission):
    def has_permission(self, request):
        return request.user.is_authenticated

class IsAdmin(BasePermission):
    def has_permission(self, request):
        return request.user.is_authenticated and request.user.role == 'admin' and request.user.is_superuser

class IsOfficer(BasePermission):
    def has_permission(self, request):
        return request.user.is_authenticated and request.user.role == 'cityClerk'

class IsReservationManager(BasePermission):
    def has_permission(self, request):
        return request.user.is_authenticated and request.user.role == 'squareManager'

class IsOfficerOrReservationManager(BasePermission):
    def has_permission(self, request):
        return request.user.is_authenticated and request.user.role in ['cityClerk', 'checker']

class IsSeller(BasePermission):
    def has_permission(self, request):
        return request.user.is_authenticated and request.user.role in ['seller']        

class IsPublic(BasePermission):
    """Pouze pro nepřihlášené uživatele."""
    def has_permission(self, request):
        return not request.user.is_authenticated