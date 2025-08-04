from rest_framework import serializers
from datetime import timedelta
from booking.models import Event, MarketSlot
import logging

from trznice.utils import RoundedDateTimeField
from .models import Event, Reservation, Square
from account.models import CustomUser
from product.serializers import EventProductSerializer

logger = logging.getLogger(__name__)


#----------------------SHORT SERIALIZERS---------------------------------

class EventShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Square
        fields = ["id", "name"]
        extra_kwargs = {
            "id": {"read_only": True},
            "name": {"read_only": True, "help_text": "Název náměstí"}
        }

class UserShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "username"]
        extra_kwargs = {
            "id": {"read_only": True},
            "username": {"read_only": True, "help_text": "username uživatele"}
        }

class SquareShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Square
        fields = ["id", "name"]
        extra_kwargs = {
            "id": {"read_only": True},
            "name": {"read_only": True, "help_text": "Název náměstí"}
        }

#------------------------------------------------------------------------




#------------------------NORMAL SERIALIZERS------------------------------

class ReservationSerializer(serializers.ModelSerializer):
    reserved_from = RoundedDateTimeField()
    reserved_to = RoundedDateTimeField()

    event = EventShortSerializer(read_only=True)
    user = UserShortSerializer(read_only=True)
    market_slot = serializers.PrimaryKeyRelatedField(
        queryset=MarketSlot.objects.filter(is_deleted=False), required=True
    )
    
    class Meta:
        model = Reservation
        fields = [
            "id", "market_slot",
            "used_extension", "reserved_from", "reserved_to",
            "created_at", "status", "note", "final_price",
            "event", "user"
        ]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            "event": {"help_text": "ID (Event), ke které rezervace patří", "required": True},
            "market_slot": {"help_text": "ID konkrétního prodejního místa (MarketSlot)", "required": True},
            "user": {"help_text": "ID a název uživatele, který rezervaci vytváří", "required": True},
            "used_extension": {"help_text": "Velikost rozšíření v m², které chce uživatel využít", "required": True},
            "reserved_from": {"help_text": "Datum a čas začátku rezervace", "required": True},
            "reserved_to": {"help_text": "Datum a čas konce rezervace", "required": True},
            "status": {"help_text": "Stav rezervace (reserved / cancelled)", "required": False, "default": "reserved"},
            "note": {"help_text": "Poznámka k rezervaci (volitelné)", "required": False},
            "final_price": {"help_text": "Cena za Rezervaci, počítá se podle plochy prodejního místa a počtů dní.", "required": False, "default": 0},
        }

    def to_internal_value(self, data):
        # Accept both "market_slot" and legacy "marketSlot" keys for compatibility
        if "marketSlot" in data and "market_slot" not in data:
            data["market_slot"] = data["marketSlot"]
        # Debug: log incoming data for troubleshooting
        logger.debug(f"ReservationSerializer.to_internal_value input data: {data}")
        return super().to_internal_value(data)

    def validate(self, data):

        errors = {}

        if event is None:
            logger.error("Reservation validation error: event is None")
            errors['event'] = ["Událost (event) je povinná."]

        logger.debug(f"ReservationSerializer.validate market_slot: {data.get('market_slot')}, event: {data.get('event')}")
        # Get the event object from the provided event id (if present)
        event_id = self.initial_data.get("event")
        if event_id:
            try:
                event = Event.objects.get(pk=event_id)
                data["event"] = event
            except Event.DoesNotExist:
                raise serializers.ValidationError({"event": "Zadaná akce (event) neexistuje."})
        else:
            event = data.get("event")

        market_slot = data.get("market_slot")
        # --- FIX: Ensure event is set before permission check in views ---
        if event is None and market_slot is not None:
            event = market_slot.event
            data["event"] = event
            logger.debug(f"ReservationSerializer.validate auto-filled event from market_slot: {event}")



        user = data.get("user")
        request_user = self.context["request"].user if "request" in self.context else None

        # If user is not specified, use the logged-in user
        if user is None and request_user is not None:
            user = request_user
            data["user"] = user

        # If user is specified and differs from logged-in user, check permissions
        if user is not None and request_user is not None and user != request_user:
            if request_user.role not in ["admin", "cityClerk", "squareManager"]:
                raise serializers.ValidationError("Pouze administrátor, úředník nebo správce tržiště může vytvářet rezervace pro jiné uživatele.")



        if user is None:
            raise serializers.ValidationError("Rezervace musí mít přiřazeného uživatele.")
        if user.user_reservations.filter(status="reserved").count() >= 5:
            raise serializers.ValidationError("Uživatel už má 5 aktivních rezervací.")

        reserved_from = data.get("reserved_from")
        reserved_to = data.get("reserved_to")
        used_extension = data.get("used_extension", 0)
        final_price = data.get("final_price", 0)

        if "status" in data:
            if self.instance:  # update
                if data["status"] != self.instance.status and user.role not in ["admin", "cityClerk"]:
                    raise serializers.ValidationError({
                        "status": "Pouze administrátor nebo úředník může upravit status rezervace."
                    })
        else:
            data["status"] = "reserved"

        if final_price and final_price != 0:
            if self.instance:  # update
                if final_price != self.instance.final_price and (not user or user.role not in ["admin", "cityClerk"]):
                    raise serializers.ValidationError({
                        "final_price": "Pouze administrátor nebo úředník může upravit finální cenu."
                    })
            else:  # create
                if not user or user.role not in ["admin", "cityClerk"]:
                    raise serializers.ValidationError({
                        "final_price": "Pouze administrátor nebo úředník může nastavit finální cenu."
                    })
        else:
            data["final_price"] = 0

        if data.get("final_price") < 0:
            raise serializers.ValidationError("Cena za m² nemůže být záporná.")

        if reserved_from >= reserved_to:
            raise serializers.ValidationError("Datum začátku rezervace musí být dříve než její konec.")

        if reserved_from < event.start or reserved_to > event.end:
            raise serializers.ValidationError("Rezervace musí být v rámci trvání akce.")

        overlapping = None 
        if market_slot:
            if market_slot.event != event:
                raise serializers.ValidationError("Prodejní místo nepatří do dané akce.")
            if used_extension > market_slot.available_extension:
                raise serializers.ValidationError("Požadované rozšíření překračuje dostupné rozšíření.")
            overlapping = Reservation.objects.exclude(id=self.instance.id if self.instance else None).filter(
                event=event,
                market_slot=market_slot,
                reserved_from__lt=reserved_to,
                reserved_to__gt=reserved_from,
                status="reserved"
            )

        if overlapping is not None and overlapping.exists():
            raise serializers.ValidationError("Rezervace se překrývá s jinou rezervací na stejném místě.")

        return data


class MarketSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketSlot
        fields = [
            "id", "event", "number", "status",
            "base_size", "available_extension",
            "x", "y", "width", "height",
            "price_per_m2"
        ]
    
        read_only_fields = ["id", "number"]
        extra_kwargs = {
            "event": {"help_text": "ID akce (Event), ke které toto místo patří", "required": True},
            "number": {"help_text": "Pořadové číslo prodejního místa u Akce, ke které toto místo patří", "required": False},
            "status": {"help_text": "Stav prodejního místa", "required": False},
            "base_size": {"help_text": "Základní velikost (m²)", "required": True},
            "available_extension": {"help_text": "Možnost rozšíření (m²)", "required": False, "default": 0},
            "x": {"help_text": "X souřadnice levého horního rohu", "required": True},
            "y": {"help_text": "Y souřadnice levého horního rohu", "required": True},
            "width": {"help_text": "Šířka Slotu", "required": True},
            "height": {"help_text": "Výška Slotu", "required": True},
            "price_per_m2": {"help_text": "Cena za m² tohoto místa", "required": False, "default": 0},
        }

    def validate_base_size(self, value):
        if value <= 0:
            raise serializers.ValidationError("Základní velikost musí být větší než nula.")
        return value

    def validate(self, data):
        price_per_m2 = data.setdefault("price_per_m2", 0)
        if price_per_m2 < 0:
            raise serializers.ValidationError("Cena za m² nemůže být záporná.")
        
        if data.setdefault("available_extension", 0) < 0:
            raise serializers.ValidationError("Velikost možného rozšíření musí být větší než nula.")

        if data.get("width", 0) <= 0 or data.get("height", 0) <= 0:
            raise serializers.ValidationError("Šířka a výška místa musí být větší než nula.")
        
        if data.get("x", 0) <= 0 or data.get("y", 0) <= 0:
            raise serializers.ValidationError("Souřadnice X a Y musí být větší než nula.")
        
        return data


class EventSerializer(serializers.ModelSerializer):
    square = SquareShortSerializer(read_only=True)
    square_id = serializers.PrimaryKeyRelatedField(
        queryset=Square.objects.all(), source="square", write_only=True
    )
    

    market_slots = MarketSlotSerializer(many=True, read_only=True, source="event_marketSlots")
    event_products = EventProductSerializer(many=True, read_only=True)

    start = RoundedDateTimeField()
    end = RoundedDateTimeField()

    class Meta:
        model = Event
        fields = [
            "id", "name", "description", "start", "end", "price_per_m2", "image", "market_slots", "event_products", 
            "square",     # nested read-only
            "square_id"   # required in POST/PUT
        ]
        read_only_fields = ["id"]
        extra_kwargs = {
            "name": {"help_text": "Název události", "required": True},
            "description": {"help_text": "Popis události", "required": False},
            "start": {"help_text": "Datum a čas začátku události", "required": True},
            "end": {"help_text": "Datum a čas konce události", "required": True},
            "price_per_m2": {"help_text": "Cena za m² pro rezervaci", "required": True},
            "image": {"help_text": "Obrázek nebo plán náměstí", "required": False, "allow_null": True},

            "market_slots": {"help_text": "Seznam prodejních míst vytvořených v rámci této události", "required": False},
            "event_products": {"help_text": "Seznam povolených zboží k prodeji v rámci této události", "required": False},

            "square": {"help_text": "Náměstí, na kterém se akce koná (jen ke čtení)", "required": False},
            "square_id": {"help_text": "ID Náměstí, na kterém se akce koná (jen ke zápis)", "required": True},
        }
        
    def validate(self, data):
        start = data.get("start")
        end = data.get("end")
        square = data.get("square")

        if not start or not end or not square:
            raise serializers.ValidationError("Pole start, end a square musí být vyplněné.")

        if start >= end:
            raise serializers.ValidationError("Datum začátku musí být před datem konce.")

        if data.get("price_per_m2", 0) <= 0:
            raise serializers.ValidationError("Cena za m² plochy pro rezervaci musí být větší než 0.")

        overlapping = Event.objects.exclude(id=self.instance.id if self.instance else None).filter(
            square=square,
            start__lt=end,
            end__gt=start,
        )

        if overlapping.exists():
            raise serializers.ValidationError("V tomto termínu už na daném náměstí probíhá jiná událost.")

        return data


class SquareSerializer(serializers.ModelSerializer):

    class Meta:
        model = Square
        fields = [
            "id", "name", "description", "street", "city", "psc",
            "width", "height", "grid_rows", "grid_cols", "cellsize",
            "image"
        ]
        read_only_fields = ["id"]
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

#-----------------------------------------------------------------------