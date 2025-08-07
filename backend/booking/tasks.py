from celery import shared_task
from celery.utils.log import get_task_logger
from django.conf import settings
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta, datetime
from django.apps import apps

from trznice.models import SoftDeleteModel
from booking.models import Reservation, MarketSlot
from commerce.models import Order
from account.tasks import send_email_with_context

logger = get_task_logger(__name__)

@shared_task
def test_celery_task():
    logger.info("✅ Test task executed successfully!")
    return "Hello from Celery!"


def _validate_days_input(years=None, days=None):
    if years is not None:
        return years * 365 if years > 0 else 365
    if days is not None:
        return days if days > 0 else 365
    return 365 # default fallback

@shared_task
def hard_delete_soft_deleted_records_task(years=None, days=None):
    """
    Hard delete všech objektů, které jsou soft-deleted (is_deleted=True)
    a zároveň byly označeny jako smazané (deleted_at) před více než zadaným časovým obdobím.
    Jako vstupní argument může být zadán počet let nebo dnů, podle kterého se data skartují.
    """

    total_days = _validate_days_input(years, days)

    time_period = timezone.now() - timedelta(days=total_days)

    # Pro všechny modely, které dědí z SoftDeleteModel, smaž staré smazané záznamy
    for model in apps.get_models():
        if not issubclass(model, SoftDeleteModel):
            continue
        if not model._meta.managed or model._meta.abstract:
            continue
        if not hasattr(model, "all_objects"):
            continue

        # Filtrování soft-deleted a starých
        deleted_qs = model.all_objects.filter(is_deleted=True, deleted_at__lt=time_period)
        count = deleted_qs.count()

        # Pokud budeme chtit použit custom logiku
        # for obj in deleted_qs:
        #     obj.hard_delete()

        deleted_qs.delete()

        if count > 0:
            logger.info(f"Hard deleted {count} records from {model.__name__}")
        
    return "Successfully completed hard_delete_soft_deleted_records_task"


@shared_task
def cancel_unpayed_reservations_task(minutes=30):
    """
    Smaže Rezervace podle Objednávky, pokud ta nebyla zaplacena v době 30 minut. Tím se uvolní Prodejní Místa pro nové rezervace.
    Jako vstupní argument může být zadán počet minut, podle kterého nezaplacená rezervaace bude stornovana.
    """
    if minutes <= 0:
        minutes = 30

    cutoff_time = timezone.now() - timedelta(minutes=minutes)

    orders_qs = Order.objects.select_related("user", "reservation__event").filter(
        status="pending",
        created_at__lte=cutoff_time,
        payed_at__isnull=True
    )

    count = orders_qs.count()

    for order in orders_qs:
        order.status = "cancelled"
        send_email_with_context(
            recipients=order.user.email,
            subject="Stornování objednávky",
            message=(
                f"Vaše objednávka {order.order_number} má rezervaci prodejního místa "
                f"na akci {order.reservation.event} a byla stornována po {minutes} minutách nezaplacení."
            )
        )
        order.save()

    if count > 0:
        logger.info(f"Canceled {count} unpaid orders and released their slots.")

    return "Successfully completed delete_unpayed_reservations_task"


# @shared_task
# def delete_old_reservations_task():
#     """
#     Smaže rezervace starší než 10 let počítané od začátku příštího roku.
#     """
#     now = timezone.now()
#     next_january_1 = datetime(year=now.year + 1, month=1, day=1, tzinfo=timezone.get_current_timezone())
#     cutoff_date = next_january_1 - timedelta(days=365 * 10)

#     deleted, _ = Reservation.objects.filter(created__lt=cutoff_date).delete()
#     print(f"Deleted {deleted} old reservations.")

    # return "Successfully completed delete_old_reservations_task"

