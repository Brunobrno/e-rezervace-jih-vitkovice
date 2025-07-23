from rest_framework import viewsets
from .models import Product, EventProduct
from .serializers import ProductSerializer, EventProductSerializer
from rest_framework.permissions import IsAuthenticated
from account.permissions import RoleAllowed

from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema

@extend_schema(
    tags=["Product"],
    description="Seznam produktů, jejich vytváření a úprava. Produkty lze filtrovat a třídit dle názvu nebo kódu."
)
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by("name")
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ["code"]
    ordering_fields = ["name", "code"]
    search_fields = ["name", "code"]

    permission_classes = [RoleAllowed("admin", "squareManager")]


@extend_schema(
    tags=["EventProduct"],
    description="Propojení produktů s událostmi. Zde se nastavují data prodeje konkrétního produktu na konkrétní události."
)
class EventProductViewSet(viewsets.ModelViewSet):

    queryset = EventProduct.objects.select_related("product", "event").all().order_by("start_selling_date")
    serializer_class = EventProductSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ["product", "event"]
    ordering_fields = ["start_selling_date", "end_selling_date"]
    search_fields = ["product__name", "event__name"]

    permission_classes = [RoleAllowed("admin", "squareManager")]

    # def get_queryset(self):
    #     qs = EventProduct.objects.select_related("product", "event").order_by("start_selling_date")
    #     # print("QuerySet count:", qs.count())  # Should not be zero
    #     return qs
