from django.db import models
from django.core.exceptions import ValidationError
from django.conf import settings

class Event(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    start = models.DateTimeField()
    end = models.DateTimeField()
    grid_resolution = models.FloatField(help_text="Rozlišení mřížky v metrech (např. 1.0 nebo 2.0)")
    price_per_m2 = models.DecimalField(max_digits=8, decimal_places=2, help_text="Cena za m² pro rezervaci")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Area(models.Model):
    event = models.OneToOneField(Event, on_delete=models.CASCADE, related_name="area")
    x = models.IntegerField()
    y = models.IntegerField()
    w = models.IntegerField()
    h = models.IntegerField()
    available = models.BooleanField(default=True)

    def clean(self):
        # Ověření, že se tato area nepřekrývá s jinou area ve stejném čase (přes jiný event)
        overlapping = Area.objects.exclude(id=self.id).filter(
            event__start__lt=self.event.end,
            event__end__gt=self.event.start,
            x__lt=self.x + self.w,
            x__gte=self.x - models.F("w"),
            y__lt=self.y + self.h,
            y__gte=self.y - models.F("h")
        )
        if overlapping.exists():
            raise ValidationError("Tato plocha se překrývá s jinou Area během souběžné akce.")

    def __str__(self):
        return f"Area [{self.x}, {self.y}, {self.w}, {self.h}] for {self.event.name}"

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

class Space(models.Model):
    x = models.IntegerField()
    y = models.IntegerField()
    w = models.IntegerField()
    h = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    area = models.ForeignKey(Area, on_delete=models.CASCADE, related_name="spaces")
    reservation = models.ForeignKey(Reservation, on_delete=models.SET_NULL, related_name="spaces", null=True, blank=True)

    def __str__(self):
        return f"Space at ({self.x},{self.y}) {self.w}x{self.h}"