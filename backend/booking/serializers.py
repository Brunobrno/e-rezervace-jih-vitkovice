from rest_framework import serializers
from .models import Event, MarketSlot, Reservation, Square



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

class MarketSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketSlot
        fields = [
            "id", "event", "status",
            "base_size", "available_extension",
            "x", "y", "width", "height",
            "price_per_m2"
        ]
        read_only_fields = ["id"]
        extra_kwargs = {
            "event": {"help_text": "ID akce (Event), ke které toto místo patří", "required": True},
            "status": {"help_text": "Stav prodejního místa", "required": False},
            "base_size": {"help_text": "Základní velikost (m²)", "required": True},
            "available_extension": {"help_text": "Možnost rozšíření (m²)", "required": True},
            "x": {"help_text": "X souřadnice levého horního rohu", "required": True},
            "y": {"help_text": "Y souřadnice levého horního rohu", "required": True},
            "width": {"help_text": "Šířka Slotu", "required": True},
            "height": {"help_text": "Výška Slotu", "required": True},
            "price_per_m2": {"help_text": "Cena za m² tohoto místa", "required": True},
        }

class EventSerializer(serializers.ModelSerializer):
    market_slots = MarketSlotSerializer(many=True, read_only=True, source="marketSlot_event")

    class Meta:
        model = Event
        fields = [
            "id", "name", "description", "start", "end","price_per_m2","image", "market_slots"
        ]
        read_only_fields = ["id"]
        extra_kwargs = {
            "name": {"help_text": "Název události", "required": True},
            "description": {"help_text": "Popis události", "required": False},
            "start": {"help_text": "Datum a čas začátku události", "required": True},
            "end": {"help_text": "Datum a čas konce události", "required": True},
            "price_per_m2": {"help_text": "Cena za m² pro rezervaci", "required": True},
            "image": {"help_text": "Obrázek nebo plán náměstí", "required": False},

            "market_slots": {"help_text": "Seznam prodejních míst vytvořených v rámci této události", "required": False},
        }


class SquareSerializer(serializers.ModelSerializer):
    events = EventSerializer(many=True, read_only=True, source="event_on_sqare")

    class Meta:
        model = Square
        fields = [
            "id", "name", "description", "street", "city", "psc",
            "width", "height", "grid_rows", "grid_cols", "cellsize",
            "image", "events", "quarks"
        ]
        read_only_fields = ["id", "events", "quarks"]
        extra_kwargs = {
            "name": {"help_text": "Název náměstí", "required": True},
            "description": {"help_text": "Popis náměstí", "required": False},
            "street": {"help_text": "Ulice, kde se náměstí nachází", "required": False},
            "city": {"help_text": "Město, kde se náměstí nachází", "required": False},
            "psc": {"help_text": "PSČ (5 číslic)", "required": False},
            "width": {"help_text": "Šířka náměstí v metrech", "required": True},
            "height": {"help_text": "Výška náměstí v metrech", "required": True},
            "grid_rows": {"help_text": "Počet řádků gridu", "required": True},
            "grid_cols": {"help_text": "Počet sloupců gridu", "required": True},
            "cellsize": {"help_text": "Velikost buňky gridu v pixelech", "required": True},
            "image": {"help_text": "Obrázek / mapa náměstí", "required": False},
        }