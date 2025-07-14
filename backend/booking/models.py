from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.conf import settings

CHOICE_SQUARES = (
    ((20, 45), "SMP Ostrava-jih"),
    ((45, 55), "Ostrava Jih"),
    ((0,0), "Nedefinováno")
)

class Event(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    start = models.DateTimeField()
    end = models.DateTimeField()
    grid_resolution = models.FloatField(help_text="Rozlišení mřížky v metrech (např. 1.0 nebo 2.0)")
    price_per_m2 = models.DecimalField(max_digits=8, decimal_places=2, help_text="Cena za m² pro rezervaci")

    x = models.IntegerField(default=0)
    y = models.IntegerField(default=0)

    # Pole pro výběr rozměrů z přednastavených možností
    square_size = models.CharField(
        default=CHOICE_SQUARES[2],
        max_length=20,
        choices=[(str(dim[0]) + "x" + str(dim[1]), label) for dim, label in CHOICE_SQUARES],
        help_text="Vyberte rozměry náměstí"
    )

    # šířka a výška gridu v buňkách podle square_size (nastavíme v save)
    w = models.IntegerField(editable=False, default=0)
    h = models.IntegerField(editable=False, default=0)

    street = models.CharField(max_length=255, default="Ulice není zadaná")
    city = models.CharField(max_length=255, default="Město není zadané")
    psc = models.PositiveIntegerField(
        default=12345,
        validators=[
            MaxValueValidator, 
            MinValueValidator
        ],
        help_text="Zadejte platné PSČ (5 číslic)"
    )

    image = models.ImageField(upload_to="squares-imgs/", blank=True, null=True)

    def clean(self):
        overlapping = Event.objects.exclude(id=self.id).filter(
            start__lt=self.end,
            end__gt=self.start,
        )
        overlapping = Event.objects.exclude(id=self.id).filter(
            start__lt=self.end,
            end__gt=self.start,
            x__lt=self.x + self.w,
            x__gte=self.x - models.F("w"),
            y__lt=self.y + self.h,
            y__gte=self.y - models.F("h")
        )
        if overlapping.exists():
            raise ValidationError("Tato plocha se překrývá s jinou Event během souběžné akce.")

    def save(self, *args, **kwargs):
        is_new = self.pk is None

        # Nastavení šířky a výšky podle vybraného square_size
        if self.square_size:
            dim_str = self.square_size.split("x")
            self.w = int(dim_str[0])
            self.h = int(dim_str[1])
        else:
            # Default pokud není zvoleno
            self.w = 0
            self.h = 0

        self.clean()
        super().save(*args, **kwargs)

        if is_new:
            self.generate_cells()

    def generate_cells(self):
        from .models import Cell  # vyhneme se circular importu
        for dx in range(self.w):
            for dy in range(self.h):
                Cell.objects.create(
                    x=self.x + dx,
                    y=self.y + dy,
                    w=1,
                    h=1,
                    event=self
                )

    def __str__(self):
        return self.name



class Reservation(models.Model):
    STATUS_CHOICES = [
        ("reserved", "Zarezervováno"),
        ("cancelled", "Zrušeno")
    ]
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="reservations")

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reservations")

    reserved_from = models.DateTimeField()
    reserved_to = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="reserved")
    note = models.TextField(blank=True, null=True)
    

    def clean(self):
        # Kontrola překrývajících se rezervací v rámci stejného eventu
        overlapping = Reservation.objects.exclude(id=self.id).filter(
            event=self.event,
            reserved_from__lt=self.reserved_to,
            reserved_to__gt=self.reserved_from
        )
        if overlapping.exists():
            raise ValidationError("Rezervace se časově překrývá s jinou rezervací ve stejném eventu.")

    def __str__(self):
        return f"Rezervace {self.user} na event {self.event.name}"

class Cell(models.Model):
    x = models.IntegerField()
    y = models.IntegerField()
    w = models.IntegerField()
    h = models.IntegerField()



    created_at = models.DateTimeField(auto_now_add=True)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="cells", null=True, blank=True)
    reservation = models.ForeignKey(Reservation, on_delete=models.SET_NULL, related_name="cells", null=True, blank=True)

    def __str__(self):
        return f"Cell at ({self.x},{self.y}) {self.w}x{self.h}"