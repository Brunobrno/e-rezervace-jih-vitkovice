from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from drf_spectacular.utils import extend_schema

from .models import AppConfig
from .serializers import AppConfigSerializer
from account.permissions import OnlyRolesAllowed


@extend_schema(
    tags=["AppConfig"],
    description=(
        "Globální konfigurace aplikace – správa bankovního účtu, e-mailu odesílatele a dalších nastavení. "
        "Umožňuje úpravu přes administrační rozhraní nebo API.\n\n"
        "🛠️ **Singleton model** – lze vytvořit pouze jednu instanci konfigurace.\n\n"
        "📌 **Přístup pouze pro administrátory** (`role=admin`).\n\n"
        "**Dostupné akce:**\n"
        "- `GET /api/config/` – Získání aktuální konfigurace (singleton)\n"
        "- `PUT /api/config/` – Úprava konfigurace\n\n"
        "**Poznámka:** pokus o vytvoření více než jedné konfigurace vrací chybu 400."
    )
)
class AppConfigViewSet(viewsets.ModelViewSet):
    queryset = AppConfig.objects.all()
    serializer_class = AppConfigSerializer
    permission_classes = [OnlyRolesAllowed("admin")]

    def get_object(self):
        # Always return the singleton instance
        return AppConfig.get_instance()

    def perform_update(self, serializer):
        serializer.save(last_changed_by=self.request.user)

    def perform_create(self, serializer):
        if AppConfig.objects.exists():
            raise ValidationError("Only one AppConfig instance allowed.")
        serializer.save(last_changed_by=self.request.user)
