from django.db import models
from django.utils import timezone

class ActiveManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)

class AllManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset()
    
# How to use custom object Managers: add these fields to your model, to override objects behaviour and all_objects behaviour
# objects = ActiveManager()
# all_objects = AllManager()


class SoftDeleteModel(models.Model):
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def delete(self, using=None, keep_parents=False):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    objects = ActiveManager()
    all_objects = AllManager()

    class Meta:
        abstract = True

    def delete(self, *args, **kwargs):
        # Soft delete self
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def hard_delete(self, using=None, keep_parents=False):
        super().delete(using=using, keep_parents=keep_parents)



# SiteSettings model for managing site-wide settings
"""class SiteSettings(models.Model):
    bank = models.CharField(max_length=100, blank=True)
    support_email = models.EmailField(blank=True)
    logo = models.ImageField(upload_to='settings/', blank=True, null=True)

    def __str__(self):
        return "Site Settings"

    class Meta:
        verbose_name = "Site Settings"
        verbose_name_plural = "Site Settings"

    @classmethod
    def get_solo(cls):
        obj, created = cls.objects.get_or_create(id=1)
        return obj
        
"""
