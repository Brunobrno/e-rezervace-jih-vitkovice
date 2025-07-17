import django_filters
from django.contrib.auth import get_user_model

User = get_user_model()

class UserFilter(django_filters.FilterSet):
    role = django_filters.CharFilter(field_name="role", lookup_expr="exact")
    account_type = django_filters.CharFilter(field_name="account_type", lookup_expr="exact")
    email = django_filters.CharFilter(field_name="email", lookup_expr="icontains")
    phone_number = django_filters.CharFilter(field_name="phone_number", lookup_expr="icontains")
    city = django_filters.CharFilter(field_name="city", lookup_expr="icontains")
    street = django_filters.CharFilter(field_name="street", lookup_expr="icontains")
    PSC = django_filters.CharFilter(field_name="PSC", lookup_expr="exact")
    is_active = django_filters.BooleanFilter(field_name="is_active")
    email_verified = django_filters.BooleanFilter(field_name="email_verified")
    create_time_after = django_filters.IsoDateTimeFilter(field_name="create_time", lookup_expr="gte")
    create_time_before = django_filters.IsoDateTimeFilter(field_name="create_time", lookup_expr="lte")

    class Meta:
        model = User
        fields = [
            "role", "account_type", "email", "phone_number", "city",
            "street", "PSC", "is_active", "email_verified",
            "create_time_after", "create_time_before"
        ]
