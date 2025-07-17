from rest_framework import serializers
from .models import Product, EventProduct

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "code"]
        read_only_fields = ["id"]
        extra_kwargs = {
            "name": {"help_text": "Název produktu", "required": True},
            "code": {"help_text": "Unikátní číselný kód produktu", "required": True},
        }


class EventProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventProduct
        fields = [
            "id", "product", "event",
            "start_selling_date", "end_selling_date"
        ]
        read_only_fields = ["id"]
        extra_kwargs = {
            "product": {"help_text": "ID produktu, který se bude prodávat na akci", "required": True},
            "event": {"help_text": "ID akce (Event), na které se produkt bude prodávat", "required": True},
            "start_selling_date": {"help_text": "Datum a čas začátku prodeje", "required": True},
            "end_selling_date": {"help_text": "Datum a čas konce prodeje", "required": True},
        }

    def validate(self, data):
        if data["start_selling_date"] >= data["end_selling_date"]:
            raise serializers.ValidationError("Datum začátku prodeje musí být dříve než jeho konec.")
        return data
