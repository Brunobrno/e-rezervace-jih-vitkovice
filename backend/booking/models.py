from decimal import Decimal
from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.conf import settings
from django.db.models import Max
from django.utils import timezone

from trznice.models import SoftDeleteModel
from trznice.utils import truncate_to_minutes

#náměstí
class Square(SoftDeleteModel):
    name = models.CharField(max_length=255, default="", null=False, blank=False)

    description = models.TextField(null=True, blank=True)

    street = models.CharField(max_length=255, default="Ulice není zadaná", null=False, blank=False)
    city = models.CharField(max_length=255, default="Město není zadané", null=False, blank=False)
    psc = models.PositiveIntegerField(
        default=12345,
        validators=[
            MaxValueValidator(99999),
            MinValueValidator(10000)
        ],
        help_text="Zadejte platné PSČ (5 číslic)",
        null=False, blank=False,
    )

    width = models.PositiveIntegerField(default=10)
    height = models.PositiveIntegerField(default=10)

    #Grid Parameters
    grid_rows = models.PositiveSmallIntegerField(default=60)
    grid_cols = models.PositiveSmallIntegerField(default=45)
    cellsize = models.PositiveIntegerField(default=10)

    image = models.ImageField(upload_to="squares-imgs/", blank=True, null=True)

    def clean(self):
        if self.width <= 0 :
            raise ValidationError("Šířka náměstí nemůže být menší nebo rovna nule.")
                
        if self.height <= 0:
            raise ValidationError("Výška náměstí nemůže být menší nebo rovna nule.")
        
        if self.grid_rows <= 0:
            raise ValidationError("Počet řádků mapy nemůže být menší nebo rovna nule.")
        
        if self.grid_cols <= 0:
            raise ValidationError("Počet sloupců mapy nemůže být menší nebo rovna nule.")
        
        if self.cellsize <= 0:
            raise ValidationError("Velikost mapové buňky nemůže být menší nebo rovna nule.")
        
        return super().clean()

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    
    def delete(self, *args, **kwargs):
        for event in self.square_events.all():
            event.delete()  # ✅ This triggers Event.delete()
        super().delete(*args, **kwargs)


class Event(SoftDeleteModel):
    """Celé náměstí

    Args:
        models (args): w,h skutečné rozměry náměstí | x,y souřadnice levého horního rohu
        
    """
    name = models.CharField(max_length=255, null=False, blank=False)
    description = models.TextField(blank=True, null=True)

    square = models.ForeignKey(Square, on_delete=models.CASCADE, related_name="square_events", null=False, blank=False)

    start = models.DateField()
    end = models.DateField()

    price_per_m2 = models.DecimalField(max_digits=8, decimal_places=2, help_text="Cena za m² pro rezervaci", validators=[MinValueValidator(0)], null=False, blank=False)

    
    image = models.ImageField(upload_to="squares-imgs/", blank=True, null=True)


    def clean(self):
        if not (self.start and self.end):
            raise ValidationError("Datum začátku a konce musí být neprázdné.")

        # Remove truncate_to_minutes and timezone logic
        if self.start >= self.end:
            raise ValidationError("Datum začátku musí být před datem konce.")

        overlapping = Event.objects.exclude(id=self.id).filter(
            square=self.square,
            start__lt=self.end,
            end__gt=self.start,
        )
        if overlapping.exists():
            raise ValidationError("V tomto termínu už na daném náměstí probíhá jiná událost.")

        return super().clean()

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    
    def delete(self, *args, **kwargs):

        self.event_marketSlots.all().update(is_deleted=True, deleted_at=timezone.now())
        self.event_reservations.all().update(is_deleted=True, deleted_at=timezone.now())
        self.event_products.all().update(is_deleted=True, deleted_at=timezone.now())

        return super().delete(*args, **kwargs)


class MarketSlot(SoftDeleteModel):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="event_marketSlots", null=False, blank=False)

    STATUS_CHOICES = [
        ("allowed", "Povoleno"),
        ("blocked", "Zablokováno"),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="allowed")
    number = models.PositiveSmallIntegerField(default=1, help_text="Pořadové číslo prodejního místa na svém Eventu", editable=False)

    base_size = models.FloatField(default=0, help_text="Základní velikost (m²)", validators=[MinValueValidator(0.0)], null=False, blank=False)
    available_extension = models.FloatField(default=0, help_text="Možnost rozšíření (m²)", validators=[MinValueValidator(0.0)], null=False, blank=False)

    x = models.SmallIntegerField(default=0, blank=False, validators=[MinValueValidator(0)])
    y = models.SmallIntegerField(default=0, blank=False, validators=[MinValueValidator(0)])

    width = models.PositiveIntegerField(default=0, blank=False, validators=[MinValueValidator(0)])
    height = models.PositiveIntegerField(default=0, blank=False, validators=[MinValueValidator(0)])

    price_per_m2 = models.DecimalField(
        default=Decimal("0.00"),
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Cena za m² pro toto prodejní místo. Neuvádět, pokud chcete nechat výchozí cenu za m² na tomto Eventu."
    )

    def clean(self):
        if self.base_size <= 0:
            raise ValidationError("Základní velikost prodejního místa musí být větší než nula.")
        
        return super().clean()
    
    def save(self, *args, **kwargs):
        self.full_clean()
        # TODO: Fix this hovno logic, kdy uyivatel zada 0, se nastavi cena. Vymyslet neco noveho
        # If price_per_m2 is 0, use the event default
        # if self.event and hasattr(self.event, 'price_per_m2'):
        if self.price_per_m2 == 0 and self.event and hasattr(self.event, 'price_per_m2'):
            self.price_per_m2 = self.event.price_per_m2

        # Automatically assign next available number within the same event
        if self._state.adding:
            max_number = MarketSlot.objects.filter(event=self.event).aggregate(Max('number'))['number__max'] or 0
            self.number = max_number + 1

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Prodejní místo {self.number} na {self.event}"
    
    def delete(self, *args, **kwargs):

        self.marketslot_reservations.all().update(is_deleted=True, deleted_at=timezone.now())

        return super().delete(*args, **kwargs)
    


class Reservation(SoftDeleteModel):
    STATUS_CHOICES = [
        ("reserved", "Zarezervováno"),
        ("cancelled", "Zrušeno"),
    ]

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="event_reservations", null=False, blank=False)
    market_slot = models.ForeignKey(
        'MarketSlot',
        on_delete=models.CASCADE,
        related_name='reservations',
        null=True,
        blank=True
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="user_reservations", null=False, blank=False)
    
    used_extension = models.FloatField(default=0 ,help_text="Použité rozšíření (m2)", validators=[MinValueValidator(0.0)])
    reserved_from = models.DateField(null=False, blank=False)
    reserved_to = models.DateField(null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="reserved")
    note = models.TextField(blank=True, null=True)

    final_price = models.DecimalField(
        default=0,
        blank=False,
        null=False,
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Cena vypočtena automaticky na zakladě ceny za m² prodejního místa a počtu dní rezervace."
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        null=False,
        blank=False
    )

    event_products = models.ManyToManyField("product.EventProduct", related_name="reservations", blank=True)

    def calculate_price(self):
        # Get square from event
        if not self.event or not self.event.square:
            raise ValidationError("Rezervace musí mít přiřazenou akci s náměstím.")
        square = self.event.square
        grid_area = square.grid_rows * square.grid_cols
        cellsize = square.cellsize

        # Use market_slot.price_per_m2 if set, else event.price_per_m2
        price_per_m2 = None
        if self.market_slot and self.market_slot.price_per_m2 and self.market_slot.price_per_m2 > 0:
            price_per_m2 = self.market_slot.price_per_m2
        else:
            price_per_m2 = self.event.price_per_m2

        if not price_per_m2 or price_per_m2 < 0:
            raise ValidationError("Cena za m² není dostupná nebo je záporná.")

        # Calculate final price
        final_price = Decimal(grid_area) * Decimal(cellsize) * Decimal(price_per_m2)
        # Always quantize to two decimals
        final_price = final_price.quantize(Decimal("0.01"))
        return final_price

    def clean(self):
        if not self.reserved_from or not self.reserved_to:
            raise ValidationError("Datum rezervace nemůže být prázdný.")

        # Remove truncate_to_minutes and timezone logic
        if self.reserved_from > self.reserved_to:
            raise ValidationError("Datum začátku rezervace musí být dříve než její konec.")
        if self.reserved_from == self.reserved_to:
            raise ValidationError("Začátek a konec rezervace nemohou být stejné.")

        # Only check for overlapping reservations on the same market_slot
        if self.market_slot:
            overlapping = Reservation.objects.exclude(id=self.id).filter(
                market_slot=self.market_slot,
                status="reserved",
                reserved_from__lt=self.reserved_to,
                reserved_to__gt=self.reserved_from,
            )
        else:
            raise ValidationError("Rezervace musí mít v sobě prodejní místo (MarketSlot).")

        if overlapping.exists():
            raise ValidationError("Rezervace se překrývá s jinou rezervací na stejném místě.")

        # Check event bounds (date only)
        if self.event:
            event_start = self.event.start
            event_end = self.event.end

            if self.reserved_from < event_start or self.reserved_to > event_end:
                raise ValidationError("Rezervace musí být v rámci trvání akce.")

        if self.used_extension > self.market_slot.available_extension:
            raise ValidationError("Požadované rozšíření je větší než možné rožšíření daného prodejního místa.")

        if self.market_slot and self.event != self.market_slot.event:
            raise ValidationError(f"Prodejní místo {self.market_slot} není část této akce, musí být ze stejné akce jako rezervace.")

        if self.user:
            if self.user.user_reservations.all().count() > 5:
                raise ValidationError(f"{self.user} už má 5 rezervací, víc není možno rezervovat pro jednoho uživatele.")
        else:
            raise ValidationError("Rezervace musí mít v sobě uživatele.")
        
        if self.final_price == 0 or self.final_price is None:
            self.final_price = self.calculate_price()
        elif self.final_price < 0:
            raise ValidationError("Cena nemůže být záporná.")

        return super().clean()


    def save(self, *args, validate=True, **kwargs):
        if validate:
            self.full_clean()

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Rezervace {self.user} na event {self.event.name}"
    
    def delete(self, *args, **kwargs):
        order = getattr(self, "order", None)
        if order is not None:
            order.is_deleted = True
            order.deleted_at = timezone.now()
            order.save()

        # Fix: Use a valid status value for MarketSlot
        if self.market_slot and self.market_slot.event.end > timezone.now():
            self.market_slot.status = "allowed"
            self.market_slot.save()

        # Soft delete without validation
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(validate=False)