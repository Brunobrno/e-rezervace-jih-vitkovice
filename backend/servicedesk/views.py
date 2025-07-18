from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from django.contrib.auth import get_user_model

from .models import UserRequest
from .serializers import UserRequestSerializer
from .filters import UserRequestFilter
from account.email import send_email_with_context

from rest_framework.permissions import IsAuthenticated
# from account.permissions import RoleAllowed


@extend_schema(
    tags=["UserRequest"],
    description="Správa uživatelských požadavků – vytvoření, úprava a výpis. Filtrování podle stavu, urgence, uživatele atd."
)
class UserRequestViewSet(viewsets.ModelViewSet):
    queryset = UserRequest.objects.select_related("user").all().order_by("-created_at")
    serializer_class = UserRequestSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_class = UserRequestFilter
    ordering_fields = ["urgency", "created_at"]
    search_fields = ["title", "description", "user__username"]
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user_request = serializer.save(user=self.request.user)

        # Map categories to roles responsible for handling them
        category_role_map = {
            "tech": "admin",
            "reservation": "cityClerk",
            "payment": "admin",
            "account": "admin",
            "content": "admin",
            "suggestion": "admin",
            "other": "admin"
        }

        role = category_role_map.get(user_request.category)
        if not role:
            return  # Or log: unknown category, no notification sent

        User = get_user_model()
        recipients = User.objects.filter(role=role, email__isnull=False).exclude(email="").values_list("email", flat=True)

        if not recipients:
            recipients = User.objects.filter(role='admin', email__isnull=False).exclude(email="").values_list("email", flat=True)
            if not recipients:
                return

        subject = "Nový uživatelský požadavek"
        message = f"""
                    Nový požadavek byl vytvořen:

                    Název: {user_request.title}
                    Kategorie: {user_request.get_category_display()}
                    Urgence: {user_request.get_urgency_display()}
                    Popis: {user_request.description or "—"}
                    Vytvořeno: {user_request.created_at.strftime('%d.%m.%Y %H:%M')}
                    Zadal: {user_request.user.get_full_name()} ({user_request.user.email})

                    Spravujte požadavky v systému.
                    """
        send_email_with_context(list(recipients), subject, message)
