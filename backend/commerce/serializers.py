from rest_framework import serializers
from django.utils import timezone

from trznice.utils import RoundedDateTimeField
from account.serializers import CustomUserSerializer
from booking.serializers import ReservationSerializer
from account.models import CustomUser
from booking.models import Event, MarketSlot, Reservation
from .models import Order

from decimal import Decimal


#počítaní ceny!!! (taky validní)
class SlotPriceInputSerializer(serializers.Serializer):
    slot_id = serializers.PrimaryKeyRelatedField(queryset=MarketSlot.objects.all())
    used_extension = serializers.FloatField(min_value=0)

#počítaní ceny!!! (počítá správně!!)
class PriceCalculationSerializer(serializers.Serializer):
    event = serializers.PrimaryKeyRelatedField(queryset=Event.objects.all())
    reserved_from = RoundedDateTimeField()
    reserved_to = RoundedDateTimeField()
    slots = SlotPriceInputSerializer(many=True)

    final_price = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)

    def validate(self, data):
        from django.utils.timezone import make_aware, is_naive

        reserved_from = data["reserved_from"]
        reserved_to = data["reserved_to"]

        if is_naive(reserved_from):
            reserved_from = make_aware(reserved_from)
        if is_naive(reserved_to):
            reserved_to = make_aware(reserved_to)

        duration = reserved_to - reserved_from
        days = duration.days + 1  # zahrnujeme první den

        data["reserved_from"] = reserved_from
        data["reserved_to"] = reserved_to
        data["duration"] = days

        event = None
        market_slot = None
        # You may need to fetch event/market_slot from data or DB
        # ...existing code...

        # Get square from event
        if not event or not event.square:
            raise serializers.ValidationError("Akce musí mít přiřazené náměstí.")
        square = event.square
        grid_area = square.grid_rows * square.grid_cols
        cellsize = square.cellsize

        # Use market_slot.price_per_m2 if set, else event.price_per_m2
        price_per_m2 = None
        if market_slot and market_slot.price_per_m2 and market_slot.price_per_m2 > 0:
            price_per_m2 = market_slot.price_per_m2
        else:
            price_per_m2 = event.price_per_m2

        if not price_per_m2 or price_per_m2 < 0:
            raise serializers.ValidationError("Cena za m² není dostupná nebo je záporná.")

        # Calculate final price
        final_price = Decimal(grid_area) * Decimal(cellsize) * Decimal(price_per_m2)
        final_price = final_price.quantize(Decimal("0.01"))

        data["final_price"] = final_price
        return data



class OrderSerializer(serializers.ModelSerializer):
    created_at = RoundedDateTimeField(read_only=True, required=False)
    payed_at = RoundedDateTimeField(read_only=True, required=False)

    user = CustomUserSerializer(read_only=True)
    reservation = ReservationSerializer(read_only=True)

    user_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(), source="user", write_only=True, required=False, allow_null=True
    )
    reservation_id = serializers.PrimaryKeyRelatedField(
        queryset=Reservation.objects.all(), source="reservation", write_only=True
    )

    #FIXME: This field is used to store the price to pay, which can be calculated from the reservation.
    # It should not be deleted from POST/PUT, as it can be derived from the reservation.
    # its better to perform calculation again with the same serializer above!!!
    price_to_pay = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, allow_null=True
    )

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "user",             # nested read-only
            "user_id",          # required in POST/PUT
            "reservation",      # nested read-only
            "reservation_id",   # required in POST/PUT
            "created_at",
            "status",
            "note",
            "price_to_pay",
            "payed_at",
        ]
        read_only_fields = ["id", "created_at", "order_number", "status", "price_to_pay", "payed_at"]
        
        extra_kwargs = {
            "user_id": {"help_text": "ID uživatele, který objednávku vytvořil", "required": False},
            "reservation_id": {"help_text": "ID rezervace, ke které se objednávka vztahuje", "required": True},
            "status": {"help_text": "Stav objednávky (např. new / paid / cancelled)", "required": False},
            "note": {"help_text": "Poznámka k objednávce (volitelné)", "required": False},
            "price_to_pay": {
                "help_text": "Celková cena, kterou má uživatel zaplatit. Pokud není zadána, převezme se z rezervace.",
                "required": False,
                "allow_null": True,
            },
            "payed_at": {"help_text": "Datum a čas, kdy byla objednávka zaplacena", "required": False},
        }

    def validate(self, data):
        if "status" in data and data["status"] not in dict(Order.STATUS_CHOICES):
            raise serializers.ValidationError({"status": "Neplatný stav objednávky."})
        
        # status = data.get("status", getattr(self.instance, "status", "pending"))
        # payed_at = data.get("payed_at", getattr(self.instance, "payed_at", None))
        reservation = data.get("reservation", getattr(self.instance, "reservation", None))
        price = data.get("price_to_pay", getattr(self.instance, "price_to_pay", 0))

        errors = {}

        # if status == "payed" and not payed_at:
        #     errors["payed_at"] = "Musíte zadat datum a čas zaplacení, pokud je objednávka zaplacena."

        # if status != "payed" and payed_at:
        #     errors["payed_at"] = "Datum zaplacení může být uvedeno pouze u zaplacených objednávek."

        if price is not None and price < 0:
            errors["price_to_pay"] = "Cena musí být větší nebo rovna 0."

        if reservation:
            if self.instance is None and hasattr(reservation, "order"):
                errors["reservation"] = "Tato rezervace již má přiřazenou objednávku."


        user = data.get("user")
        request_user = self.context["request"].user if "request" in self.context else None

        # If user is not specified, use the logged-in user
        if user is None and request_user is not None:
            user = request_user
            data["user"] = user

        # If user is specified and differs from logged-in user, check permissions
        if user is not None and request_user is not None and user != request_user:
            if request_user.role not in ["admin", "cityClerk", "squareManager"]:
                errors["user"] = "Pouze administrátor, úředník nebo správce tržiště může vytvářet rezervace pro jiné uživatele."

        if errors:
            raise serializers.ValidationError(errors)

        return data

    def create(self, validated_data):
        if validated_data.get("reservation"):
            validated_data["price_to_pay"] = validated_data["reservation"].final_price

        validated_data["user"] = validated_data.pop("user_id", validated_data.get("user"))
        validated_data["reservation"] = validated_data.pop("reservation_id", validated_data.get("reservation"))

        return super().create(validated_data)

    def update(self, instance, validated_data):
        old_status = instance.status
        new_status = validated_data.get("status", old_status)

        if old_status != "payed" and new_status == "payed":
            validated_data["payed_at"] = timezone.now()
        return super().update(instance, validated_data)