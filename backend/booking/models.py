from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.conf import settings

CHOICE_SQUARES = (
    ((20, 45), "SMP Ostrava-jih"),
    ((45, 55), "Ostrava Jih"),
    ((0, 0), "Nedefinováno")
)

class Event(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    start = models.DateTimeField()
    end = models.DateTimeField()
    grid_resolution = models.FloatField(help_text="Rozlišení mřížky v metrech (např. 1.0 nebo 2.0)")
    price_per_m2 = models.DecimalField(max_digits=8, decimal_places=2, help_text="Cena za m² pro rezervaci", validators=[MinValueValidator(0)])

    x = models.IntegerField(default=0)
    y = models.IntegerField(default=0)

    w = models.IntegerField(editable=False, default=0)
    h = models.IntegerField(editable=False, default=0)

    square_size = models.CharField(
        default="0x0",  # Oprava z předchozí chyby
        max_length=20,
        choices=[(f"{dim[0]}x{dim[1]}", label) for dim, label in CHOICE_SQUARES],
        help_text="Vyberte rozměry náměstí"
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
        # Kontrola překrývání jiných Eventů ve stejný čas a prostor
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
        if self.square_size:
            dim_str = self.square_size.split("x")
            self.w = int(dim_str[0])
            self.h = int(dim_str[1])
        else:
            self.w = 0
            self.h = 0

        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class MarketSlot(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="market_slot")

    STATUS_CHOICES = [
        ("empty", "Nezakoupeno"),
        ("blocked", "Zablokovano"),
        ("taken", "Plné")
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="empty")

    available_extension = models.FloatField(default=0 ,help_text="Možnost rozšíření (m2)")

    first_x = models.SmallIntegerField(default=0, blank=False)
    first_y = models.SmallIntegerField(default=0, blank=False)

    second_x = models.SmallIntegerField(default=0, blank=False)
    second_y = models.SmallIntegerField(default=0, blank=False)

    price = models.DecimalField(default=0, blank=False, validators=[MinValueValidator(0)], max_digits=8, decimal_places=2,)


class Reservation(models.Model):
    STATUS_CHOICES = [
        ("reserved", "Zarezervováno"),
        ("cancelled", "Zrušeno"),
    ]

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="reservations")
    marketSlot = models.ForeignKey(MarketSlot, on_delete=models.CASCADE, related_name="reservations", null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reservations")

    reserved_from = models.DateTimeField()
    reserved_to = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="reserved")
    note = models.TextField(blank=True, null=True)

    final_price = models.DecimalField(blank=True, null=True, default=0, max_digits=8, decimal_places=2)

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
            # Pokud není definovaný konkrétní MarketSlot – kontrola všech bez slotu
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

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Rezervace {self.user} na event {self.event.name}"
