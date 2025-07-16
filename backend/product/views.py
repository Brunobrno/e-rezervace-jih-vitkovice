from rest_framework import viewsets, permissions
from .models import Product, EventProduct
from .serializers import ProductSerializer, EventProductSerializer
from rest_framework.permissions import IsAuthenticated

from drf_spectacular.utils import extend_schema

@extend_schema(
    tags=["Product - basic"],
    description="Basic Product requesty"
)
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]  # You can customize this as needed

@extend_schema(
    tags=["Product - basic"],
    description="Basic Product(Event) requesty"
)
class EventProductViewSet(viewsets.ModelViewSet):
    queryset = EventProduct.objects.select_related("product", "event").all()
    serializer_class = EventProductSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # You can add any automatic logic here (e.g., setting defaults or user tracking)
        serializer.save()
