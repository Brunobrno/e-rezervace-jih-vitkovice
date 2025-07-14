from django.db import models
from booking.models import Event

class Product(models.Model):
    name = models.CharField(max_length=255)
    code = models.PositiveIntegerField()
    
class EventProduct(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="product")
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="event")
    start_selling_date = models.DateTimeField(auto_now=True, auto_created=True)
    end_selling_date = models.DateTimeField(auto_created=True)