from django.db import models
from booking.models import Event

class Product(models.Model):
    name = models.CharField(max_length=255)
    code = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.name} : {self.code}"

    
class EventProduct(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="product")
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="event")
    start_selling_date = models.DateTimeField(auto_created=True)
    end_selling_date = models.DateTimeField(auto_created=True)

    def __str__(self):
        return f"{self.product} at {self.event}"