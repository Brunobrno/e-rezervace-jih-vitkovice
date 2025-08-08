from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.core.validators import RegexValidator, MaxValueValidator, MinValueValidator

from django.conf import settings
from django.db import models
from django.utils import timezone
from datetime import timedelta

from trznice.models import SoftDeleteModel

from django.contrib.auth.models import UserManager

import logging

logger = logging.getLogger(__name__)

# Custom User Manager to handle soft deletion
class CustomUserActiveManager(UserManager):
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)

# Custom User Manager to handle all users, including soft deleted
class CustomUserAllManager(UserManager):
    def get_queryset(self):
        return super().get_queryset()


class CustomUser(SoftDeleteModel, AbstractUser):
    groups = models.ManyToManyField(
        Group,
        related_name="customuser_set",  # <- přidáš related_name
        blank=True,
        help_text="The groups this user belongs to.",
        related_query_name="customuser",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="customuser_set",  # <- přidáš related_name
        blank=True,
        help_text="Specific permissions for this user.",
        related_query_name="customuser",
    )

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
        unique=True,
        max_length=16,
        blank=True,
        validators=[RegexValidator(r'^\+?\d{9,15}$', message="Zadejte platné telefonní číslo.")]
    )
    
    email = models.EmailField(unique=True, db_index=True)
    create_time = models.DateTimeField(auto_now_add=True)

    var_symbol = models.PositiveIntegerField(null=True, blank=True, validators=[
            MaxValueValidator(9999999999),
            MinValueValidator(0)
        ],
    )
    bank_account = models.CharField(
        max_length=50,
        null=True, 
        blank=True, 
        validators=[
        RegexValidator(
            regex=r'^(\d{0,6}-)?\d{10}/\d{4}$', # r'^(\d{0,6}-)?\d{2,10}/\d{4}$' for range 2-10 digits
            message="Zadejte platné číslo účtu ve formátu [prefix-]číslo_účtu/kód_banky, např. 1234567890/0100 nebo 123-4567890/0100.",
            code='invalid_bank_account'
            )
        ],
    )
    ICO = models.CharField(
        max_length=8,
        blank=True,
        null=True,
        validators=[
            RegexValidator(
                regex=r'^\d{8}$',
                message="IČO musí obsahovat přesně 8 číslic.",
                code='invalid_ico'
            )
        ]
    )

    #TODO: Je RČ nutné? možná sjednotit do jednoho fieldu s IČO?
    RC = models.CharField(
        max_length=11,
        blank=True,
        null=True,
        validators=[
            RegexValidator(
                regex=r'^\d{6}\/\d{3,4}$',
                message="Rodné číslo musí být ve formátu 123456/7890.",
                code='invalid_rc'
            )
        ]
    )

    city = models.CharField(null=True, blank=True, max_length=100)
    street = models.CharField(null=True, blank=True, max_length=200)

    PSC = models.CharField(
        max_length=5,
        blank=True,
        null=True,
        validators=[
            RegexValidator(
                regex=r'^\d{5}$',
                message="PSČ musí obsahovat přesně 5 číslic.",
                code='invalid_psc'
            )
        ]
    )
    GDPR = models.BooleanField(default=False)

    is_active = models.BooleanField(default=False)

    # Custom object managers to handle SoftDelete model logic
    objects = CustomUserActiveManager()
    all_objects = CustomUserAllManager()

    REQUIRED_FIELDS = ['email']


    def __str__(self):
        # return f"{self.email} at {self.create_time.strftime('%d-%m-%Y %H:%M:%S')}"
        return f"{self.username} {self.email}"

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
    
    def delete(self, *args, **kwargs):
        self.is_active = False

        self.tickets.all().update(is_deleted=True, deleted_at=timezone.now())
        self.user_reservations.all().update(is_deleted=True, deleted_at=timezone.now())
        self.orders.all().update(is_deleted=True, deleted_at=timezone.now())

        return super().delete(*args, **kwargs)
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None  # check BEFORE saving

        if is_new:
            # Ensure first_name and last_name are provided before generating login
            if self.first_name and self.last_name:
                self.username = self.generate_login(self.first_name, self.last_name)
            if self.is_superuser or self.role in ["admin", "cityClerk", "squareManager"]:
                # self.is_staff = True
                self.is_active = True
                if self.role == 'admin':
                    self.is_staff = True
                    self.is_superuser = True
                if self.is_superuser:
                    self.role = 'admin'
            else:
                self.is_staff = False
        
        return super().save(*args, **kwargs)

        # NEMAZAT prozatim to necháme, kdybychom to potrebovali

        # Now assign permissions after user exists
        # if is_new and self.role:
        if self.role:
            from account.utils import assign_permissions_based_on_role
            logger.debug(f"Assigning permissions to: {self.email} with role {self.role}")
            assign_permissions_based_on_role(self)
        
        # super().save(*args, **kwargs)  # save once, after prep
    

