from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError

from trznice.models import SoftDeleteModel
from booking.models import Event

class Product(SoftDeleteModel):
    name = models.CharField(max_length=255)
    code = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.name} : {self.code}"
    
    def delete(self, *args, **kwargs):

        self.event_products.all().update(is_deleted=True, deleted_at=timezone.now())

        return super().delete(*args, **kwargs)


class EventProduct(SoftDeleteModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="event_products")
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="event_products")
    start_selling_date = models.DateTimeField()
    end_selling_date = models.DateTimeField()

    def clean(self):
        # Basic presence check (could be omitted if always required via form or not null)
        if not self.product or not self.event:
            return

        # Check for overlapping dates
        overlapping = EventProduct.objects.exclude(id=self.id).filter(
            event=self.event,
            product=self.product,
            start_selling_date__lt=self.end_selling_date,
            end_selling_date__gt=self.start_selling_date,
        )

        if overlapping.exists():
            raise ValidationError("Toto zboží už se prodává v tomto období na této akci.")

        # Check if sale period is within the event bounds
        if self.event and (self.start_selling_date < self.event.start or self.end_selling_date > self.event.end):
            raise ValidationError("Prodej zboží musí být v rámci trvání akce.")

    def save(self, *args, **kwargs):
        self.full_clean()  # This includes clean_fields() + clean() + validate_unique()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product} at {self.event}"