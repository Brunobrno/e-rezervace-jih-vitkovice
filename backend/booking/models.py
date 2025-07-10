from django.db import models
from django.core.exceptions import ValidationError

from ..account.models import CustomUser

class Event(models.Model):
    name = models.CharField(max_length=256)
    description = models.TextField(null=True, blank=True)
    address = models.CharField(max_length=256, null=True, blank=True)
    date_start = models.DateTimeField(null=True, blank=True)
    date_end = models.DateTimeField(null=True, blank=True)
    price_m2 = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.date_start.date()})"


class Cell(models.Model):
    x = models.SmallIntegerField()
    y = models.SmallIntegerField()
    width = models.SmallIntegerField(default=1)   # možnost různých rozměrů
    height = models.SmallIntegerField(default=1)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='cells')
    overwrite_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    class Meta:
        unique_together = ('x', 'y', 'event')  # jedna pozice na jedno event

    def __str__(self):
        return f"Cell {self.x},{self.y} for {self.event.name}"


class Reservation(models.Model):
    seller = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    cell = models.OneToOneField(Cell, on_delete=models.CASCADE)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)

    def clean(self):
        if self.cell and self.seller:
            if Reservation.objects.filter(seller=self.seller, cell__event=self.cell.event).count() >= 5:
                raise ValidationError("Lze rezervovat max. 5 míst pro jeden event.")

    def __str__(self):
        return f"{self.seller} rezervoval {self.cell}"
