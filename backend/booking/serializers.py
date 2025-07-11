from django.db import transaction
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import Event, Area, Reservation, Cell



# Primárně pro výpis/čtení Spacu v Areas
class CellSerializer(serializers.ModelSerializer):
    @extend_schema_field(str)
    def get_i(self, obj):
        return str(obj.id)

    i = serializers.SerializerMethodField(help_text="String ID pro react-grid-layout")

    class Meta:
        model = Cell
        fields = ["id", "x", "y", "w", "h", "i", "reservation"]
        extra_kwargs = {
            "reservation": {"help_text": "ID rezervace pokud je místo zabrané, jinak null"}
        }


# Vytvoření nebo úprava Area
class AreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = ["id", "event", "x", "y", "w", "h", "available"]
        extra_kwargs = {
            "x": {"help_text": "Počáteční X pozice area"},
            "y": {"help_text": "Počáteční Y pozice area"},
            "w": {"help_text": "Šířka v buňkách"},
            "h": {"help_text": "Výška v buňkách"},
            "available": {"help_text": "Zda je plocha volná/rezervovatelná"},
            "event": {"help_text": "ID eventu, ke kterému area patří"}
        }


# Používá se pro výpis a vytvoření eventů
class EventSerializer(serializers.ModelSerializer):
    area = AreaSerializer(read_only=True, help_text="Automaticky vytvořená nebo navázaná plocha")

    class Meta:
        model = Event
        fields = [
            "id", "name", "description", "start", "end",
            "grid_resolution", "price_per_m2", "area"
        ]
        extra_kwargs = {
            "grid_resolution": {"help_text": "Velikost jedné buňky v metrech"},
            "price_per_m2": {"help_text": "Cena za m² rezervovaného místa"}
        }


# Používá obchodník pro vytvoření rezervace
class ReservationSerializer(serializers.ModelSerializer):
    cells = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Cell.objects.filter(reservation__isnull=True),
        help_text="Seznam ID políček (Cells), které chce obchodník zabrat"
    )

    class Meta:
        model = Reservation
        fields = [
            "id", "user", "event", "reserved_from", "reserved_to",
            "status", "note", "created_at", "cells"
        ]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            "user": {"help_text": "ID aktuálně přihlášeného obchodníka"},
            "event": {"help_text": "ID eventu, pro který se rezervace vytváří"},
            "reserved_from": {"help_text": "Datum a čas začátku rezervace"},
            "reserved_to": {"help_text": "Datum a čas konce rezervace"},
            "status": {"help_text": "Stav rezervace"},
            "note": {"help_text": "Poznámka od úředníka"}
        }

    

    def create(self, validated_data):
        cells = validated_data.pop("cells")
        with transaction.atomic():
            reservation = Reservation.objects.create(**validated_data)
            for cell in cells:
                # Ověření, že cell skutečně náleží eventu přes Area
                if cell.area.event != reservation.event:
                    raise serializers.ValidationError(
                        f"Políčko ({cell.x},{cell.y}) nepatří do eventu {reservation.event.name}."
                    )
                cell.reservation = reservation
                cell.save()
        return reservation