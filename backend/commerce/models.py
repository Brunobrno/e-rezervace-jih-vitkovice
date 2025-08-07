import uuid

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError

from trznice.models import SoftDeleteModel
from booking.models import Reservation
from account.models import CustomUser

class Order(SoftDeleteModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders", null=False, blank=False)
    reservation = models.OneToOneField(Reservation, on_delete=models.CASCADE, related_name="order", null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)

    STATUS_CHOICES = [
        ("payed", "Zaplaceno"),
        ("pending", "Čeká na zaplacení"),
        ("cancelled", "Stornovano"),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    
    note = models.TextField(blank=True, null=True)

    price_to_pay = models.DecimalField(blank=True, 
                                    default=0, 
                                    max_digits=8, 
                                    decimal_places=2, 
                                    validators=[MinValueValidator(0)], 
                                    help_text="Cena k zaplacení. Počítá se automaticky z Rezervace.",
                                    )
    
    payed_at = models.DateTimeField(null=True, blank=True)
    

    def __str__(self):
        return f"Objednávka {self.id} od uživatele {self.user}"
    
    def clean(self):

        if not self.user_id:
            raise ValidationError("Zadejte ID Uživatele.")
        
        if not self.reservation_id:
            raise ValidationError("Zadejte ID Rezervace.")

        # Safely get product and event objects for error messages and validation
        try:
            reservation_obj = Reservation.objects.get(pk=self.reservation_id)
        except Reservation.DoesNotExist:
            raise ValidationError("Neplatné ID Rezervace.")

        try:
            user_obj = CustomUser.objects.get(pk=self.user_id)
            if reservation_obj.user != user_obj:
                raise ValidationError("Tato rezervace naleží jinému Uživatelovi.")
        except CustomUser.DoesNotExist:
            raise ValidationError("Neplatné ID Uživatele.")

        # Overlapping sales window check
        overlapping = Order.objects.exclude(id=self.id).filter(
            reservation_id=self.reservation_id,
        )
        if overlapping.exists():
            raise ValidationError("Tato Rezervace už je zaplacena.")
        
        errors = {}

        # If order is marked as payed, it must have a payed_at timestamp
        if self.status == "payed" and not self.payed_at:
            errors["payed_at"] = "Musíte zadat datum a čas zaplacení, pokud je objednávka zaplacena."

        # If order is not payed, payed_at must be null
        if self.status != "payed" and self.payed_at:
            errors["payed_at"] = "Datum zaplacení může být uvedeno pouze u zaplacených objednávek."

        if self.reservation.final_price:
            self.price_to_pay = self.reservation.final_price
        else:
            errors["price_to_pay"] = "Chyba v Rezervaci, neplatná cena."

        # Price must be greater than zero
        if self.price_to_pay:
            if self.price_to_pay < 0:
                errors["price_to_pay"] = "Cena musí být větší než 0."
            # if self.price_to_pay == 0 and self.reservation:
        else:
            errors["price_to_pay"] = "Nemůže být prázdné."

        if errors:
            raise ValidationError(errors)
    

    def save(self, *args, **kwargs):
        self.full_clean()

        if self.status == "cancelled":
            self.reservation.status = "cancelled"
        else:
            self.reservation.status = "reserved"
        self.reservation.save()

        # if self.reservation:
        #     self.price_to_pay = self.reservation.final_price
        
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        self.reservation.status = "cancelled"
        self.reservation.save()
        
        return super().delete(*args, **kwargs)
