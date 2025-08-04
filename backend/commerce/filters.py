import django_filters
from .models import Order


class OrderFilter(django_filters.FilterSet):
    reservation = django_filters.NumberFilter(field_name="reservation__id")
    user = django_filters.NumberFilter(field_name="user__id")
    status = django_filters.ChoiceFilter(choices=Order.STATUS_CHOICES)

    class Meta:
        model = Order
        fields = ["reservation", "user", "status"]
