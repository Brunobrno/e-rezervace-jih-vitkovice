import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator, MinLengthValidator

from django.conf import settings
from django.db import models
from django.utils import timezone
from datetime import timedelta
import uuid


class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Administrátor'),
        ('seller', 'Prodejce'),
        ('squareManager', 'Správce tržiště'),
        ('cityClerk', 'Úředník'),
        ('checker', 'Kontrolor'),
    )
    role = models.CharField(max_length=32, choices=ROLE_CHOICES, null=True, blank=True)

    ACCOUNT_TYPES = (
        ('company', 'Firma'),
        ('individual', 'Fyzická osoba')
    )
    account_type = models.CharField(max_length=32, choices=ACCOUNT_TYPES, null=True, blank=True)

    email_verified = models.BooleanField(default=False)

    phone_number = models.CharField(
        max_length=15,
        blank=True,
        validators=[RegexValidator(r'^\+?\d{9,15}$', message="Zadejte platné telefonní číslo.")]
    )
    
    email = models.EmailField(unique=True, db_index=True)
    otc = models.UUIDField(default=uuid.uuid4, editable=False, db_index=True)
    create_time = models.DateTimeField(auto_now_add=True)

    var_symbol = models.IntegerField(null=True, blank=True)
    bank_acc = models.IntegerField(null=True, blank=True)
    ICO = models.IntegerField(null=True, blank=True)

    city = models.CharField(null=True, blank=True)
    street = models.CharField(null=True, blank=True)
    PSC = models.IntegerField(null=True, blank=True)

    is_active = models.BooleanField(default=False)

    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return f"{self.email} at {self.create_time.strftime('%d-%m-%Y %H:%M:%S')}"

    def generate_login(self, first_name, last_name):
        """
        Vygeneruje login ve formátu: prijmeni + 2 písmena jména bez diakritiky.
        Přidá číslo pokud už login existuje.
        """
        from django.utils.text import slugify
        base_login = slugify(f"{last_name}{first_name[:2]}")
        login = base_login
        counter = 1
        while CustomUser.objects.filter(username=login).exists():
            login = f"{base_login}{counter}"
            counter += 1
        return login
    
    
    def save(self, *args, **kwargs):
        if not self.pk and not self.username:  # nový uživatel a ještě není username
            self.username = self.generate_username()
        super().save(*args, **kwargs)
    


class OneTimeLoginToken(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=24)  # link valid 24h
        super().save(*args, **kwargs)

    def is_valid(self):
        return (not self.used) and (timezone.now() < self.expires_at)
    

