from rest_framework import serializers
from .models import ServiceTicket

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
        # Example validation: status must be one of the defined choices
        if "status" in data and data["status"] not in dict(ServiceTicket.STATUS_CHOICES):
            raise serializers.ValidationError({"status": "Neplatný stav požadavku."})
        
        if "category" in data and data["category"] not in dict(ServiceTicket.CATEGORY_CHOICES):
            raise serializers.ValidationError({"category": "Neplatn8 kategorie požadavku."})

        if "urgency" in data and data["urgency"] not in dict(ServiceTicket.URGENCY_CHOICES):
            raise serializers.ValidationError({"urgency": "Neplatná urgence."})

        return data
