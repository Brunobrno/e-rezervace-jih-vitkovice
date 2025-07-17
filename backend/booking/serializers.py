from rest_framework import serializers
from .models import Event, MarketSlot, Reservation


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            "id", "name", "description", "start", "end",
            "grid_resolution", "price_per_m2",
            "x", "y", "w", "h", "square_size",
            "street", "city", "psc", "image"
        ]
        read_only_fields = ["id", "x", "y", "w", "h"]
        extra_kwargs = {
            "name": {"help_text": "Název události", "required": True},
            "description": {"help_text": "Popis události", "required": False},
            "start": {"help_text": "Datum a čas začátku události", "required": True},
            "end": {"help_text": "Datum a čas konce události", "required": True},
            "grid_resolution": {"help_text": "Rozlišení mřížky v metrech (např. 1.0 nebo 2.0)", "required": True},
            "price_per_m2": {"help_text": "Cena za m² pro rezervaci", "required": True},
            "square_size": {"help_text": "Vyberte rozměry náměstí", "required": True},
            "street": {"help_text": "Ulice, kde se událost koná", "required": False},
            "city": {"help_text": "Město konání události", "required": False},
            "psc": {"help_text": "PSČ (5 číslic)", "required": False},
            "image": {"help_text": "Obrázek nebo plán náměstí", "required": False},
        }


class MarketSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketSlot
        fields = [
            "id", "event", "status",
            "base_size", "available_extension",
            "first_x", "first_y", "second_x", "second_y",
            "price_per_m2"
        ]
        read_only_fields = ["id"]
        extra_kwargs = {
            "event": {"help_text": "ID akce (Event), ke které toto místo patří", "required": True},
            "status": {"help_text": "Stav prodejního místa", "required": False},
            "base_size": {"help_text": "Základní velikost (m²)", "required": True},
            "available_extension": {"help_text": "Možnost rozšíření (m²)", "required": True},
            "first_x": {"help_text": "X souřadnice levého horního rohu", "required": True},
            "first_y": {"help_text": "Y souřadnice levého horního rohu", "required": True},
            "second_x": {"help_text": "X souřadnice pravého dolního rohu", "required": True},
            "second_y": {"help_text": "Y souřadnice pravého dolního rohu", "required": True},
            "price_per_m2": {"help_text": "Cena za m² tohoto místa", "required": True},
        }


class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = [
            "id", "event", "marketSlot", "user",
            "used_extension", "reserved_from", "reserved_to",
            "created_at", "status", "note", "final_price"
        ]
        read_only_fields = ["id", "created_at", "final_price"]
        extra_kwargs = {
            "event": {"help_text": "ID akce (Event), ke které rezervace patří", "required": True},
            "marketSlot": {"help_text": "Volitelné – ID konkrétního prodejního místa (MarketSlot)", "required": False},
            "user": {"help_text": "ID uživatele, který rezervaci vytváří", "required": True},
            "used_extension": {"help_text": "Velikost rozšíření v m², které chce uživatel využít", "required": True},
            "reserved_from": {"help_text": "Datum a čas začátku rezervace", "required": True},
            "reserved_to": {"help_text": "Datum a čas konce rezervace", "required": True},
            "status": {"help_text": "Stav rezervace (reserved / cancelled)", "required": False},
            "note": {"help_text": "Poznámka k rezervaci (volitelné)", "required": False},
        }

    def validate(self, data):
        if data["reserved_from"] >= data["reserved_to"]:
            raise serializers.ValidationError("Datum začátku rezervace musí být dříve než její konec.")
        return data
