from rest_framework import serializers
from .models import Product, EventProduct
from booking.models import Event

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "code"]
        read_only_fields = ["id"]
        extra_kwargs = {
            "name": {"help_text": "Název produktu"},
            "code": {"help_text": "Interní číselný kód produktu"}
        }


class EventProductSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        help_text="ID produktu, který bude prodáván"
    )
    event = serializers.PrimaryKeyRelatedField(
        queryset=Event.objects.all(),
        help_text="ID eventu, na kterém bude produkt dostupný"
    )
    start_selling_date = serializers.DateTimeField(
        help_text="Datum a čas začátku prodeje produktu na akci"
    )
    end_selling_date = serializers.DateTimeField(
        help_text="Datum a čas ukončení prodeje produktu na akci"
    )

    class Meta:
        model = EventProduct
        fields = [
            "id", "product", "event", "start_selling_date", "end_selling_date"
        ]
        read_only_fields = ["id"]

    def validate(self, data):
        start = data.get("start_selling_date")
        end = data.get("end_selling_date")

        if start and end and start >= end:
            raise serializers.ValidationError(
                {"end_selling_date": "Konec prodeje musí být po začátku prodeje."}
            )

        return data