from rest_framework import serializers

from trznice.utils import RoundedDateTimeField
from .models import AppConfig


class AppConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppConfig
        fields = "__all__"
        read_only_fields = ["last_changed_by", "last_changed_at"]