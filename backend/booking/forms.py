from django import forms
from django.core.exceptions import ValidationError
from .models import Reservation

class ReservationAdminForm(forms.ModelForm):
    class Meta:
        model = Reservation
        fields = '__all__'

    def clean(self):
        cleaned_data = super().clean()
        event = cleaned_data.get('event')
        products = cleaned_data.get('event_products')

        if event and products:
            invalid_products = [p for p in products if p.event != event]
            if invalid_products:
                product_names = ', '.join(str(p) for p in invalid_products)
                raise ValidationError(f"Některé produkty nepatří k této akci: {product_names}")

        return cleaned_data
