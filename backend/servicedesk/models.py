from django.db import models
from django.conf import settings


class UserRequest(models.Model):
    STATUS_CHOICES = [
        ("new", "Nový"),
        ("in_progress", "Řeší se"),
        ("resolved", "Vyřešeno"),
        ("closed", "Uzavřeno"),
    ]

    URGENCY_CHOICES = [
        ("low", "Nízká"),
        ("medium", "Střední"),
        ("high", "Vysoká"),
        ("critical", "Kritická"),
    ]

    CATEGORY_CHOICES = [
        ("tech", "Technická chyba"),
        ("reservation", "Chyba při rezervaci"),
        ("payment", "Problém s platbou"),
        ("account", "Problém s účtem"),
        ("content", "Nesrovnalost v obsahu"),
        ("suggestion", "Návrh na zlepšení"),
        ("other", "Jiný"),
    ]

    title = models.CharField(max_length=255, verbose_name="Název")
    description = models.TextField(verbose_name="Popis problému", null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="Zadavatel", related_name="userRequest_user")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="new", verbose_name="Stav", null=True, blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="tech", verbose_name="Kategorie", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Datum")
    urgency = models.CharField(max_length=10, choices=URGENCY_CHOICES, default="medium", verbose_name="Urgence", null=True, blank=True)

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"