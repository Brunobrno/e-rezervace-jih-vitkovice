from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, filters
from drf_spectacular.utils import extend_schema

from account.permissions import RoleAllowed
from .serializers import OrderSerializer
from .filters import OrderFilter
from .models import Order



@extend_schema(
    tags=["Order"],
    description=(
        "Správa objednávek – vytvoření, úprava a výpis. Filtrování podle rezervace, uživatele atd.\n\n"
        "🔍 **Fulltextové vyhledávání (`?search=`)** prohledává:\n"
        "- číslo objednávky (`order_number`)\n"
        "- poznámku (`note`)\n"
        "- e-mail uživatele (`user.email`)\n"
        "- jméno a příjmení uživatele (`user.first_name`, `user.last_name`)\n"
        "- poznámku rezervace (`reservation.note`)\n\n"
        "**Příklady:** `?search=OBJ-123456`, `?search=jan.novak@example.com`, `?search=poznámka`"
    )
)
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().select_related("user", "reservation").order_by("-created_at")
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_class = OrderFilter
    ordering_fields = ["created_at", "price_to_pay", "payed_at"]
    search_fields = [
        "order_number",
        "note",
        "user__email",
        "user__first_name",
        "user__last_name",
        "reservation__note",
    ]
    permission_classes = [RoleAllowed("admin", "cityClerk", "seller")]

    def get_queryset(self):
        queryset = Order.objects.select_related("user", "reservation").order_by("-created_at")
        user = self.request.user
        if hasattr(user, "role") and user.role == "seller":
            return queryset.filter(user=user)
        return queryset
