from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from trznice.utils import RoundedDateTimeField
from .models import Product, EventProduct
from booking.models import Event
# from booking.serializers import EventSerializer

class ProductSerializer(serializers.ModelSerializer):
    code = serializers.CharField(
        validators=[
            UniqueValidator(queryset=Product.objects.all(), message="Produkt s tímto kódem už existuje.")
        ],
        help_text="Unikátní číselný kód produktu"
    )
        
    class Meta:
        model = Product
        fields = ["id", "name", "code"]
        read_only_fields = ["id"]
        extra_kwargs = {
            "name": {"help_text": "Název produktu", "required": True},
            "code": {"help_text": "Unikátní číselný kód produktu", "required": True},
        }

    def validate_name(self, value):
        value = value.strip()
        
        if not value:
            raise serializers.ValidationError("Název Zboží (Produktu) nemůže být prázdný.")
        
        if len(value) > 255:
            raise serializers.ValidationError("Název nesmí být delší než 255 znaků.")
        return value


class EventProductSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), write_only=True
    )

    start_selling_date = RoundedDateTimeField()
    end_selling_date = RoundedDateTimeField()

    class Meta:
        model = EventProduct
        fields = [
            'id',
            'product',         # nested read-only
            'product_id',      # required in POST/PUT
            'event',
            'start_selling_date',
            'end_selling_date',
        ]

        read_only_fields = ["id", "product"]
        extra_kwargs = {
            "product_id": {"help_text": "ID produktu, který se bude prodávat na akci", "required": True},
            "event_id": {"help_text": "ID akce (Event), na které se produkt bude prodávat", "required": True},
            "start_selling_date": {"help_text": "Datum a čas začátku prodeje", "required": True},
            "end_selling_date": {"help_text": "Datum a čas konce prodeje", "required": True},
        }


    def create(self, validated_data):
        validated_data["product"] = validated_data.pop("product_id")
        return super().create(validated_data)
    
    def validate(self, data):
        product = data.get("product_id")
        event = data.get("event")
        start = data.get("start_selling_date")
        end = data.get("end_selling_date")

        if start >= end:
            raise serializers.ValidationError("Datum začátku prodeje musí být dříve než jeho konec.")

        if event and (start < event.start or end > event.end):
            raise serializers.ValidationError("Prodej zboží musí být v rámci trvání akce.")

        # When updating, exclude self instance
        instance_id = self.instance.id if self.instance else None

        # Check for overlapping EventProducts for the same product/event
        overlapping = EventProduct.objects.exclude(id=instance_id).filter(
            event=event,
            product_id=product,
            start_selling_date__lt=end,
            end_selling_date__gt=start,
        )
        if overlapping.exists():
            raise serializers.ValidationError("Toto zboží už se prodává v tomto období na této akci.")

        # # Check for duplicate product-event pair
        # duplicate = EventProduct.objects.exclude(id=instance_id).filter(
        #     event=event,
        #     product_id=product,
        # )
        # if duplicate.exists():
        #     raise serializers.ValidationError(f"V rámci akce {event} už je {product} zaregistrováno.")

        return data
