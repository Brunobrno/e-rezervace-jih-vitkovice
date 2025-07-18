import django_filters
from .models import UserRequest

class UserRequestFilter(django_filters.FilterSet):
    user = django_filters.NumberFilter(field_name="user__id")
    status = django_filters.ChoiceFilter(choices=UserRequest.STATUS_CHOICES)
    urgency = django_filters.ChoiceFilter(choices=UserRequest.URGENCY_CHOICES)
    category = django_filters.ChoiceFilter(choices=UserRequest.CATEGORY_CHOICES)

    class Meta:
        model = UserRequest
        fields = ["user", "status", "urgency", "category"]
