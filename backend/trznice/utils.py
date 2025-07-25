from rest_framework.fields import DateTimeField
from datetime import datetime


def truncate_to_minutes(dt: datetime) -> datetime:
    return dt.replace(second=0, microsecond=0)


class RoundedDateTimeField(DateTimeField):
    def to_internal_value(self, value):
        dt = super().to_internal_value(value)
        return truncate_to_minutes(dt)