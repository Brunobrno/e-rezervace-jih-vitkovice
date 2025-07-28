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

    start = models.DateTimeField()
    end = models.DateTimeField()

    price_per_m2 = models.DecimalField(max_digits=8, decimal_places=2, help_text="Cena za m² pro rezervaci", validators=[MinValueValidator(0)], null=False, blank=False)

    
    image = models.ImageField(upload_to="squares-imgs/", blank=True, null=True)


    def clean(self):
        if not (self.start and self.end):
            raise ValidationError("Datum začátku a konce musí být neprázné.")
        
        # Vynecháme sekunky, mikrosecundy atd.
        self.start = truncate_to_minutes(self.start)
        self.end = truncate_to_minutes(self.end)

        # Zkontroluj, že začátek je před koncem
        if self.start >= self.end:
            raise ValidationError("Datum začátku musí být před datem konce.")

        # Zkontroluj, že se událost nepřekrývá s jinou na stejném náměstí
        overlapping = Event.objects.exclude(id=self.id).filter(
            square=self.square,
            start__lt=self.end,
            end__gt=self.start,
        )
        if overlapping.exists():
            raise ValidationError("V tomto termínu už na daném náměstí probíhá jiná událost.")
        
        # Zavolej rodičovskou validaci (volitelné, pokud nepoužíváš dědičnost)
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
        ("empty", "Nezakoupeno"),
        ("blocked", "Zablokováno"),
        ("taken", "Plné")
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="empty")
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
        # If price_per_m2 is 0, use the event default
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
    marketSlot = models.ForeignKey(MarketSlot, on_delete=models.CASCADE, related_name="marketslot_reservations", null=False, blank=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="user_reservations", null=False, blank=False)
    
    used_extension = models.FloatField(default=0 ,help_text="Použité rozšíření (m2)", validators=[MinValueValidator(0.0)])
    reserved_from = models.DateTimeField(null=False, blank=False)
    reserved_to = models.DateTimeField(null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="reserved")
    note = models.TextField(blank=True, null=True)

    final_price = models.DecimalField(blank=True, 
                                    default=0, 
                                    max_digits=8, 
                                    decimal_places=2, 
                                    validators=[MinValueValidator(0)], 
                                    help_text="Cena vypočtena automaticky na zakladě ceny za m² prodejního místa a počtu dní rezervace."
                                    )

    event_products = models.ManyToManyField("product.EventProduct", related_name="reservations", blank=True)

    def clean(self):
        if not self.reserved_from or not self.reserved_to:
            raise ValidationError("Čas rezervace nemůže být prázdný.")

        # Vynecháme sekunky, mikrosecundy atd.
        self.reserved_from = truncate_to_minutes(self.reserved_from)
        self.reserved_to = truncate_to_minutes(self.reserved_to)
        
        if self.reserved_from >= self.reserved_to:
            raise ValidationError("Datum začátku rezervace musí být před datem konce.")

        duration = self.reserved_to - self.reserved_from
        duration_days = duration.days

        # Allow only exact 1, 7, or 30 days
        if duration_days not in (1, 7, 30):
            raise ValidationError(
                "Rezervovat prodejní místo je možno pouze na: den (1 den), týden (7 dnů), nebo měsíc (30 dnů)."
            )

        if self.marketSlot:
            overlapping = Reservation.objects.exclude(id=self.id).filter(
                event=self.event,
                marketSlot=self.marketSlot,
                reserved_from__lt=self.reserved_to,
                reserved_to__gt=self.reserved_from,
                # status="reserved"
            )
        else:
            raise ValidationError("Rezervace musí mít v sobě prodejní místo (MarketSlot).")

        if overlapping.exists():
            raise ValidationError("Rezervace se překrývá s jinou rezervací na stejném místě.")

        if self.reserved_from < self.event.start or self.reserved_to > self.event.end:
            raise ValidationError("Rezervace musí být v rámci trvání akce.")
        
        if (self.used_extension > self.marketSlot.available_extension):
            raise ValidationError("Požadované rozšíření je větší než možné rožšíření daného prodejního místa.")
        
        if self.marketSlot:
            if self.event != self.marketSlot.event:
                raise ValidationError(f"Prodejní místo {self.marketSlot} není část této akce, musí být ze stejné akce jako rezervace.")
        
        if self.user:
            if self.user.user_reservations.all().count() > 5:
                raise ValidationError(f"{self.user} už má 5 rezervací, víc není možno rezervovat pro jednoho uživatele.")
        else:
            raise ValidationError(f"Rezervace musí mít v sobě uživatele.")

        return super().clean()


    def save(self, *args, **kwargs):
        self.full_clean()
        if (self.marketSlot):
            duration = (self.reserved_to - self.reserved_from).days
            self.final_price = duration * (self.marketSlot.price_per_m2 * (
            Decimal(str(self.marketSlot.base_size)) + Decimal(str(self.used_extension))
        ))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Rezervace {self.user} na event {self.event.name}"
    