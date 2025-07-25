from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError

from trznice.models import SoftDeleteModel
from booking.models import Event

class Product(SoftDeleteModel):
    name = models.CharField(max_length=255, verbose_name="Název produktu")
    code = models.PositiveIntegerField(unique=True, verbose_name="Unitatní kód produktu")

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
        if not self.product_id or not self.event_id:
            raise ValidationError("Zadejte Akci a Produkt.")

        # Safely get product and event objects for error messages and validation
        try:
            product_obj = Product.objects.get(pk=self.product_id)
        except Product.DoesNotExist:
            raise ValidationError("Neplatné ID Zboží (Produktu).")

        try:
            event_obj = Event.objects.get(pk=self.event_id)
        except Event.DoesNotExist:
            raise ValidationError("Neplatné ID Akce (Eventu).")

        # Overlapping sales window check
        overlapping = EventProduct.objects.exclude(id=self.id).filter(
            event_id=self.event_id,
            product_id=self.product_id,
            start_selling_date__lt=self.end_selling_date,
            end_selling_date__gt=self.start_selling_date,
        )
        if overlapping.exists():
            raise ValidationError("Toto zboží už se prodává v tomto období na této akci.")

        # Ensure sale window is inside event bounds
        if self.start_selling_date < event_obj.start or self.end_selling_date > event_obj.end:
            raise ValidationError("Prodej zboží musí být v rámci trvání akce.")

        # Ensure product+event pair is unique
        if EventProduct.objects.exclude(pk=self.pk).filter(product_id=self.product_id, event_id=self.event_id).exists():
            raise ValidationError(f"V rámci akce {event_obj} už je {product_obj} zaregistrováno.")

    def save(self, *args, **kwargs):
        self.full_clean()  # This includes clean_fields() + clean() + validate_unique()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product} at {self.event}"