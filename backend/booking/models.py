from django.db import models

from ..account.models import CustomUser

# Create your models here.
class Cell:
    x = models.SmallIntegerField(null=True)
    y = models.SmallIntegerField(null=True)

    overwrite_price = models.DecimalField(null=True)



class Event:
    name = models.TextField(null=True)
    description = models.TextField(null=True)

    date_start = models.DateTimeField(null=True)
    date_end = models.DateTimeField(null=True)

    price_m2 = models.DecimalField(null=True)(null=True)

    cells = models.ForeignKey(Cell, on_delete=models.CASCADE)

class Reservation:
    seller = models.ForeignKey(CustomUser, on_delete=models.CASCADE) # max 5 cells per person