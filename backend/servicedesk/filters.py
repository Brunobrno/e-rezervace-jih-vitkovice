import django_filters
from .models import ServiceTicket

class ServiceTicketFilter(django_filters.FilterSet):
    user = django_filters.NumberFilter(field_name="user__id")
    status = django_filters.ChoiceFilter(choices=ServiceTicket.STATUS_CHOICES)
    urgency = django_filters.ChoiceFilter(choices=ServiceTicket.URGENCY_CHOICES)
    category = django_filters.ChoiceFilter(choices=ServiceTicket.CATEGORY_CHOICES)

    class Meta:
        model = ServiceTicket
        fields = ["user", "status", "urgency", "category"]
