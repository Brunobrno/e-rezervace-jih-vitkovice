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
        max_length=16,
        blank=True,
        validators=[RegexValidator(r'^\+?\d{9,15}$', message="Zadejte platné telefonní číslo.")]
    )
    
    email = models.EmailField(unique=True, db_index=True)
    otc = models.UUIDField(default=uuid.uuid4, editable=False, db_index=True)
    create_time = models.DateTimeField(auto_now_add=True)

    var_symbol = models.IntegerField(null=True, blank=True)
    bank_account = models.CharField(null=True, blank=True)
    ICO = models.CharField(null=True, blank=True)
    RC = models.CharField(max_length=11, blank=True, null=True)

    city = models.CharField(null=True, blank=True, max_length=100)
    street = models.CharField(null=True, blank=True, max_length=200)
    PSC = models.CharField(null=True, blank=True, max_length=5)

    GDPR = models.BooleanField(default=False)

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
        is_new = self.pk is None  # check BEFORE saving

        if is_new:
            if self.is_superuser or self.role in ["admin", "cityClerk", "squareManager"]:
                self.is_staff = True
                self.is_active = True
                if self.role == 'admin':
                    self.is_superuser = True
            else:
                self.is_staff = False

        if self.email_verified:
            self.is_active = True
        
        super().save(*args, **kwargs)

        # Now assign permissions after user exists
        # if is_new and self.role:
        if self.role:
            from account.utils import assign_permissions_based_on_role
            print(f"Assigning permissions to: {self.email} with role {self.role}")
            assign_permissions_based_on_role(self)
        
        # super().save(*args, **kwargs)  # save once, after prep
    

