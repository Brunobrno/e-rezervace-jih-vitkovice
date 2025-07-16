import django_filters
from .models import Event

class EventFilter(django_filters.FilterSet):
    start_after = django_filters.IsoDateTimeFilter(field_name="start", lookup_expr="gte")
    end_before = django_filters.IsoDateTimeFilter(field_name="end", lookup_expr="lte")
    city = django_filters.CharFilter(lookup_expr="icontains")
    square_size = django_filters.CharFilter(lookup_expr="exact")

    class Meta:
        model = Event
        fields = ["start_after", "end_before", "city", "square_size"]
