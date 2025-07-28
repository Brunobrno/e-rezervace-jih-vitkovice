import django_filters
from .models import Event, Reservation

class EventFilter(django_filters.FilterSet):
    start_after = django_filters.IsoDateTimeFilter(field_name="start", lookup_expr="gte")
    end_before = django_filters.IsoDateTimeFilter(field_name="end", lookup_expr="lte")
    city = django_filters.CharFilter(field_name="square__city", lookup_expr="icontains")
    square = django_filters.NumberFilter(field_name="square__id")  # přidáno filtrování podle ID náměstí

    class Meta:
        model = Event
        fields = ["start_after", "end_before", "city", "square"]  # přidáno "square"



class ReservationFilter(django_filters.FilterSet):
    event = django_filters.NumberFilter(field_name="event__id")
    user = django_filters.NumberFilter(field_name="user__id")
    status = django_filters.ChoiceFilter(choices=Reservation.STATUS_CHOICES)

    class Meta:
        model = Reservation
        fields = ["event", "user", "status"]
