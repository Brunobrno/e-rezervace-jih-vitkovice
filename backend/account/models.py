import uuid
from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractUser

from django.conf import settings
from django.db import models
from django.utils import timezone
from datetime import timedelta
import uuid



USER_ROLES = {
    "FR": "Freshman",
    "SO": "Sophomore",
    "JR": "Junior",
    "SR": "Senior",
    "GR": "Graduate",
}

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Administrator'),
        ('seller', 'Prodejce'),
        ('squareManager', 'Správce tržiště'),
        ('cityClerk', 'Úředník'),
        ('checker', 'Kontrolor')
    )
    role = models.CharField(max_length=32, choices=ROLE_CHOICES, default='customer')

    phone_number = models.CharField(max_length=15, blank=True)
    email = models.EmailField(unique=True, db_index=True)
    otc = models.UUIDField(default=uuid.uuid4, editable=False, db_index=True)
    create_time = models.DateTimeField(auto_now=True)
    
    def str(self):
        return f"{self.email} at {self.c_time.strftime('%d-%m-%Y %H:%M:%S')}"
    


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
    

