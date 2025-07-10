from django.db import models
from django.core.exceptions import ValidationError
from django.conf import settings

class Space(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="spaces")
    x = models.IntegerField()
    y = models.IntegerField()
    w = models.IntegerField()
    h = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Space by {self.user} at ({self.x},{self.y}) {self.w}x{self.h}"

class Event(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    start = models.DateTimeField()
    end = models.DateTimeField()
    grid_resolution = models.FloatField(help_text="Rozlišení mřížky v metrech (např. 1.0 nebo 2.0)")
    price_per_m2 = models.DecimalField(max_digits=8, decimal_places=2, help_text="Cena za m² pro rezervaci")

    def __str__(self):
        return self.name

class Area(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="areas")
    x = models.IntegerField()
    y = models.IntegerField()
    w = models.IntegerField()
    h = models.IntegerField()
    available = models.BooleanField(default=True, help_text="Zda je tato část prostoru dostupná k rezervaci")

    def __str__(self):
        return f"Area [{self.x}, {self.y}, {self.w}, {self.h}] for {self.event.name}"

class Reservation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reservations")
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="reservations")
    space = models.OneToOneField(Space, on_delete=models.CASCADE, related_name="reservation")
    reserved_from = models.DateTimeField()
    reserved_to = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.reserved_from < self.event.start or self.reserved_to > self.event.end:
            raise ValidationError("Rezervace musí být v rámci času daného eventu.")

        overlapping = Reservation.objects.filter(
            event=self.event,
            reserved_from__lt=self.reserved_to,
            reserved_to__gt=self.reserved_from
        ).exclude(id=self.id).filter(
            space__x__lt=self.space.x + self.space.w,
            space__x__gte=self.space.x - models.F("space__w"),
            space__y__lt=self.space.y + self.space.h,
            space__y__gte=self.space.y - models.F("space__h")
        )

        if overlapping.exists():
            raise ValidationError("Tento prostor nebo čas se překrývá s jinou rezervací.")

        # Ověření že celý prostor je v dostupných oblastech daného eventu
        cells_to_check = [
            (self.space.x + dx, self.space.y + dy)
            for dx in range(self.space.w)
            for dy in range(self.space.h)
        ]
        for cell_x, cell_y in cells_to_check:
            valid = Area.objects.filter(
                event=self.event,
                available=True,
                x__lte=cell_x,
                y__lte=cell_y,
                x__gte=cell_x - models.F("w") + 1,
                y__gte=cell_y - models.F("h") + 1
            ).exists()
            if not valid:
                raise ValidationError(f"Bod ({cell_x},{cell_y}) není ve schválené rezervovatelné ploše.")

    def __str__(self):
        return f"Rezervace {self.user} na event {self.event.name} ({self.space.x},{self.space.y})"