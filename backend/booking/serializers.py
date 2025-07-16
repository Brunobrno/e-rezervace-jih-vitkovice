from django.db import transaction
from rest_framework import serializers
from .models import Event, Reservation, MarketSlot, CHOICE_SQUARES


class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = [
            "id", "user", "event", "marketSlot",
            "reserved_from", "reserved_to",
            "status", "note", "created_at", "final_price"
        ]
        read_only_fields = ["id", "created_at", "final_price"]

    def validate(self, data):
        # Zajistí, že rezervace je v rámci trvání eventu (duplikace pro jistotu)
        event = data["event"]
        if data["reserved_from"] < event.start or data["reserved_to"] > event.end:
            raise serializers.ValidationError("Rezervace musí být v rámci trvání akce.")
        return data

    def create(self, validated_data):
        # Výpočet ceny při vytvoření
        market_slot = validated_data.get("marketSlot")
        event = validated_data["event"]

        if market_slot:
            area_x = abs(market_slot.second_x - market_slot.first_x)
            area_y = abs(market_slot.second_y - market_slot.first_y)
            m2 = area_x * area_y * event.grid_resolution ** 2
        else:
            m2 = 0  # nebo raise error pokud je potřeba slot

        validated_data["final_price"] = m2 * float(event.price_per_m2)

        with transaction.atomic():
            reservation = Reservation.objects.create(**validated_data)
        return reservation


class EventSerializer(serializers.ModelSerializer):
    square_size = serializers.ChoiceField(
        choices=[(f"{dim[0]}x{dim[1]}", label) for dim, label in CHOICE_SQUARES],
        help_text="Vyberte rozměry náměstí"
    )
    w = serializers.IntegerField(read_only=True, help_text="Šířka gridu (nastavena automaticky)")
    h = serializers.IntegerField(read_only=True, help_text="Výška gridu (nastavena automaticky)")

    class Meta:
        model = Event
        fields = [
            "id", "name", "description", "start", "end", "grid_resolution", "price_per_m2",
            "x", "y", "square_size", "w", "h",
            "street", "city", "psc",
        ]
        read_only_fields = ["id", "w", "h"]

    def create(self, validated_data):
        return Event.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
