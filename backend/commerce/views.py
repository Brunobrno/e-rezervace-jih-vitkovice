from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view

from decimal import Decimal

from drf_spectacular.utils import extend_schema


from account.permissions import RoleAllowed
from rest_framework.permissions import IsAuthenticated
from .serializers import OrderSerializer, PriceCalculationSerializer
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
    # permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Order.objects.select_related("user", "reservation").order_by("-created_at")
        user = self.request.user
        if hasattr(user, "role") and user.role == "seller":
            return queryset.filter(user=user)
        return queryset




class CalculateReservationPriceView(APIView):

    @extend_schema(
        request=PriceCalculationSerializer,
        responses={200: {"type": "object", "properties": {"final_price": {"type": "number"}}}},
        tags=["Order"],
        summary="Calculate reservation price",
        description="Spočítá celkovou cenu rezervace pro zvolený slot, použitá rozšíření a trvání rezervace"
    )
    def post(self, request):
        serializer = PriceCalculationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        # PriceCalculationSerializer now returns 'final_price' in validated_data
        return Response({"final_price": data["final_price"]}, status=status.HTTP_200_OK)