from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.conf import settings


class AppConfig(models.Model):
    bank_account = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        validators=[
            RegexValidator(
                regex=r'^(\d{0,6}-)?\d{10}/\d{4}$',
                message=(
                    "Zadejte platné číslo účtu ve formátu [prefix-]číslo_účtu/kód_banky, "
                    "např. 1234567890/0100 nebo 123-4567890/0100."
                ),
                code='invalid_bank_account'
            )
        ],
    )
    sender_email = models.EmailField()

    last_changed_by = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        verbose_name="Kdo naposled udělal změny.",
        on_delete=models.SET_NULL,  # 🔄 Better than CASCADE to preserve data
        related_name="app_config",
        null=True,
        blank=True
    )
    last_changed_at = models.DateTimeField(
        auto_now=True,  # 🔄 Use auto_now to update on every save
        verbose_name="Kdy byly naposled udělany změny."
    )

    def save(self, *args, **kwargs):
        if not self.pk and AppConfig.objects.exists():
            raise ValidationError('Only one AppConfig instance allowed.')
        return super().save(*args, **kwargs)

    def __str__(self):
        return "App Configuration"

    @classmethod
    def get_instance(cls):
        return cls.objects.first()

# Usage:

# config = AppConfig.get_instance()
# if config:
#     print(config.bank_account) 