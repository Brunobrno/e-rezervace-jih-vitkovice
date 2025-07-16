from django.db import transaction
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import Event, Reservation, CHOICE_SQUARES


class ReservationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Reservation
        fields = [
            "id", "user", "event", "reserved_from", "reserved_to",
            "status", "note", "created_at"
        ]
        read_only_fields = ["id", "created_at"]

    def validate(self, data):
        return data

    def validate(self, data):
        return data

    def create(self, validated_data):
        cells = validated_data.pop("cells")
        with transaction.atomic():
            reservation = Reservation.objects.create(**validated_data)
            for cell in cells:
                cell.reservation = reservation
                cell.save()
        return reservation


class EventSerializer(serializers.ModelSerializer):
    square_size = serializers.ChoiceField(
        choices=[(str(dim[0]) + "x" + str(dim[1]), label) for dim, label in CHOICE_SQUARES],
        help_text="Vyberte rozměry náměstí"
    )
    w = serializers.IntegerField(read_only=True, help_text="Šířka gridu (nastavena automaticky)")
    h = serializers.IntegerField(read_only=True, help_text="Výška gridu (nastavena automaticky)")

    class Meta:
        model = Event
        fields = [
            "id", "name", "description", "start", "end", "grid_resolution", "price_per_m2",
            "x", "y", "square_size", "w", "h",
            "street", "city", "psc", #"image",
        ]
        read_only_fields = ["id", "w", "h"]

    def create(self, validated_data):
        # w a h se nastaví v modelu save()
        event = Event.objects.create(**validated_data)
        return event

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance