from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.conf import settings
from decimal import Decimal
from django.db.models import Max

CHOICE_SQUARES = (
    ((20, 45), "SMP Ostrava-jih"),
    ((45, 55), "Ostrava Jih"),
    ((0, 0), "Nedefinováno")
)

#náměstí
class Square(models.Model):
    name = models.CharField(max_length=255, default="", null=False)

    description = models.TextField(null=True, blank=True)

    street = models.CharField(max_length=255, default="")
    city = models.CharField(max_length=100, default="")
    PSC = models.CharField(max_length=5, default="")

    width = models.PositiveIntegerField(default=10)
    height = models.PositiveIntegerField(default=10)

    #Grid Parameters
    grid_rows = models.PositiveSmallIntegerField(default=60)
    grid_cols = models.PositiveSmallIntegerField(default=45)
    grid_collSize = models.PositiveSmallIntegerField(default=10)

    def __str__(self):
        return self.name


class Event(models.Model):
    """Celé náměstí

    Args:
        models (args): w,h skutečné rozměry náměstí | x,y souřadnice levého horního rohu
        
    """
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    square = models.ForeignKey(Square, on_delete=models.CASCADE, related_name="event_on_sqare", null=True)

    start = models.DateTimeField()
    end = models.DateTimeField()
    grid_resolution = models.FloatField(help_text="Rozlišení mřížky v metrech (např. 1.0 nebo 2.0)", validators=[MinValueValidator(0.0)])
    price_per_m2 = models.DecimalField(max_digits=8, decimal_places=2, help_text="Cena za m² pro rezervaci", validators=[MinValueValidator(0)])



    x = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    y = models.IntegerField(default=0, validators=[MinValueValidator(0)])

    w = models.IntegerField(editable=False, default=0, validators=[MinValueValidator(0)])
    h = models.IntegerField(editable=False, default=0, validators=[MinValueValidator(0)])

    square_size = models.CharField(
        default="0x0",  # Oprava z předchozí chyby
        max_length=20,
        choices=[(f"{dim[0]}x{dim[1]}", label) for dim, label in CHOICE_SQUARES],
        help_text="Vyberte rozměry náměstí",
        null=False
    )

    #layout_data = models.JSONField(default=list, help_text="2D layout polí mapy ve formátu React Grid Layout")

    street = models.CharField(max_length=255, default="Ulice není zadaná")
    city = models.CharField(max_length=255, default="Město není zadané")
    psc = models.PositiveIntegerField(
        default=12345,
        validators=[
            MaxValueValidator(99999),
            MinValueValidator(10000)
        ],
        help_text="Zadejte platné PSČ (5 číslic)"
    )

    image = models.ImageField(upload_to="squares-imgs/", blank=True, null=True)

    def clean(self):
        overlapping = Event.objects.exclude(id=self.id).filter(
            start__lt=self.end,
            end__gt=self.start,
            x__lt=self.x + self.w,
            x__gte=self.x - self.w,
            y__lt=self.y + self.h,
            y__gte=self.y - self.h,
        )
        if overlapping.exists():
            raise ValidationError("Tato plocha se překrývá s jinou akcí ve stejném čase.")

    def save(self, *args, **kwargs):
        '''
        TOHLE JE SPRÁVNÝ KÓD/NAHRAZEN JINÝM KTERÝ NEBUDE ŘEŠIT ZATÍM ROZMĚRY EVENTU(DEFAULTNĚ BUDUE NASTAVENÝ PŘES CELÉ NÁMĚSTÍ)
        if self.square_size:
            dim_str = self.square_size.split("x")
            self.w = int(dim_str[0])
            self.h = int(dim_str[1])
        else:
            self.w = 0
            self.h = 0

        '''
        self.x = 0
        self.y = 0

        # Nastav šířku a výšku podle square_size
        if self.square_size:
            try:
                dim_str = self.square_size.split("x")
                self.w = int(dim_str[0])
                self.h = int(dim_str[1])
            except (ValueError, IndexError):
                self.w = 0
                self.h = 0
        else:
            self.w = 0
            self.h = 0

        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class MarketSlot(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="marketSlot_event")

    STATUS_CHOICES = [
        ("empty", "Nezakoupeno"),
        ("blocked", "Zablokováno"),
        ("taken", "Plné")
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="empty")
    number = models.PositiveSmallIntegerField(default=1, help_text="Pořadové číslo prodejního místa na svém Eventu")

    base_size = models.FloatField(default=0, help_text="Základní velikost (m²)", validators=[MinValueValidator(0.0)])
    available_extension = models.FloatField(default=0, help_text="Možnost rozšíření (m²)", validators=[MinValueValidator(0.0)])

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

    def save(self, *args, **kwargs):
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
    


class Reservation(models.Model):
    STATUS_CHOICES = [
        ("reserved", "Zarezervováno"),
        ("cancelled", "Zrušeno"),
    ]

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="reservation_event")
    marketSlot = models.ForeignKey(MarketSlot, on_delete=models.CASCADE, related_name="reservations_marketSlot", null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reservations_user")
    
    used_extension = models.FloatField(default=0 ,help_text="Použité rozšíření (m2)", validators=[MinValueValidator(0.0)])
    
    reserved_from = models.DateTimeField()
    reserved_to = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="reserved")
    note = models.TextField(blank=True, null=True)

    final_price = models.DecimalField(blank=True, null=True, default=0, max_digits=8, decimal_places=2, validators=[MinValueValidator(0)])

    def clean(self):
        if self.marketSlot:
            overlapping = Reservation.objects.exclude(id=self.id).filter(
                event=self.event,
                marketSlot=self.marketSlot,
                reserved_from__lt=self.reserved_to,
                reserved_to__gt=self.reserved_from,
                status="reserved"
            )
        else:
            overlapping = Reservation.objects.exclude(id=self.id).filter(
                event=self.event,
                marketSlot__isnull=True,
                reserved_from__lt=self.reserved_to,
                reserved_to__gt=self.reserved_from,
                status="reserved"
            )

        if overlapping.exists():
            raise ValidationError("Rezervace se překrývá s jinou rezervací na stejném místě.")

        if self.reserved_from < self.event.start or self.reserved_to > self.event.end:
            raise ValidationError("Rezervace musí být v rámci trvání akce.")
        
        if (self.used_extension > self.marketSlot.available_extension):
            raise ValidationError("Požadované rozšíření je větší než možné rožšíření daného prodejního místa.")

    def save(self, *args, **kwargs):
        self.clean()
        self.final_price = self.marketSlot.price_per_m2 * (
        Decimal(str(self.marketSlot.base_size)) + Decimal(str(self.used_extension))
    )
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Rezervace {self.user} na event {self.event.name}" 