from rest_framework import serializers

from .models import ServiceTicket
from account.models import CustomUser


class ServiceTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceTicket
        fields = [
            "id", "title", "description", "user",
            "status", "category", "created_at", "urgency"
        ]
        read_only_fields = ["id", "created_at"]

        extra_kwargs = {
            "title": {"help_text": "Stručný název požadavku", "required": True},
            "description": {"help_text": "Detailní popis problému", "required": False},
            "user": {"help_text": "ID uživatele, který požadavek zadává", "required": True},
            "status": {"help_text": "Stav požadavku (new / in_progress / resolved / closed)", "required": False},
            "category": {"help_text": "Kategorie požadavku (tech / reservation / payment / account / content / suggestion / other)", "required": True},
            "urgency": {"help_text": "Urgence požadavku (low / medium / high / critical)", "required": False},
        }

    def validate(self, data):
        user = data.get("user", None)

        # if user is None:
        #     raise serializers.ValidationError("Product is a required field.")
        # # Check if user exists in DB
        # if not CustomUser.objects.filter(pk=user.pk if hasattr(user, 'pk') else user).exists():
        #     raise serializers.ValidationError("Neplatné ID Užívatele.")
        
        # Example validation: status must be one of the defined choices
        if "status" in data and data["status"] not in dict(ServiceTicket.STATUS_CHOICES):
            raise serializers.ValidationError({"status": "Neplatný stav požadavku."})
        
        if "category" in data and data["category"] not in dict(ServiceTicket.CATEGORY_CHOICES):
            raise serializers.ValidationError({"category": "Neplatná kategorie požadavku."})


        if "urgency" in data and data["urgency"] not in dict(ServiceTicket.URGENCY_CHOICES):
            raise serializers.ValidationError({"urgency": "Neplatná urgence."})
        
        title = data.get("title", "").strip()
        if not title:
            raise serializers.ValidationError("Název požadavku nemůže být prázdný.")
        if len(title) > 255:
            raise serializers.ValidationError("Název požadavku nemůže být delší než 255 znaků.")
        data["title"] = title  # Optional: overwrite with trimmed version

        return data
