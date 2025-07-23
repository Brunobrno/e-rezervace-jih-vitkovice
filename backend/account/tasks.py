from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta, datetime
from django.apps import apps

from trznice.models import SoftDeleteModel
from booking.models import Reservation

@shared_task
def hard_delete_soft_deleted_records():
    """
    Hard delete všech objektů, které jsou soft-deleted (is_deleted=True)
    a zároveň byly označeny jako smazané (deleted_at) před více než rokem.
    """
    one_year_ago = timezone.now() - timedelta(days=365)

    # Pro všechny modely, které dědí z SoftDeleteModel, smaž staré smazané záznamy
    for model in apps.get_models():
        if issubclass(model, SoftDeleteModel):
            # dělej věci
            
            # Filtrování soft-deleted a starých
            deleted_qs = model.all_objects.filter(is_deleted=True, deleted_at__lt=one_year_ago)
            count = deleted_qs.count()
            deleted_qs.delete()  # hard delete
            print(f"Hard deleted {count} records from {model.__name__}")

@shared_task
def delete_old_reservations():
    """
    Smaže rezervace starší než 10 let počítané od začátku příštího roku.
    """
    now = timezone.now()
    next_january_1 = datetime(year=now.year + 1, month=1, day=1, tzinfo=timezone.get_current_timezone())
    cutoff_date = next_january_1 - timedelta(days=365 * 10)

    deleted, _ = Reservation.objects.filter(created__lt=cutoff_date).delete()
    print(f"Deleted {deleted} old reservations.")