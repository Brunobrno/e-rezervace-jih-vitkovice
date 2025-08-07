# from celery import shared_task
# from django.core.mail import send_mail
# from django.conf import settings
# from rest_framework.response import Response
# from django.utils import timezone
# from datetime import timedelta, datetime
# from django.apps import apps

# from trznice.models import SoftDeleteModel
# from booking.models import Reservation

# @shared_task
# def hard_delete_soft_deleted_records():
#     """
#     Hard delete všech objektů, které jsou soft-deleted (is_deleted=True)
#     a zároveň byly označeny jako smazané (deleted_at) před více než rokem.
#     """
#     one_year_ago = timezone.now() - timedelta(days=365)

#     # Pro všechny modely, které dědí z SoftDeleteModel, smaž staré smazané záznamy
#     for model in apps.get_models():
#         if issubclass(model, SoftDeleteModel):
#             # dělej věci
            
#             # Filtrování soft-deleted a starých
#             deleted_qs = model.all_objects.filter(is_deleted=True, deleted_at__lt=one_year_ago)
#             count = deleted_qs.count()
#             deleted_qs.delete()  # hard delete
#             print(f"Hard deleted {count} records from {model.__name__}")

# @shared_task
# def delete_old_reservations():
#     """
#     Smaže rezervace starší než 10 let počítané od začátku příštího roku.
#     """
#     now = timezone.now()
#     next_january_1 = datetime(year=now.year + 1, month=1, day=1, tzinfo=timezone.get_current_timezone())
#     cutoff_date = next_january_1 - timedelta(days=365 * 10)

#     deleted, _ = Reservation.objects.filter(created__lt=cutoff_date).delete()
#     print(f"Deleted {deleted} old reservations.")

from celery import shared_task
from celery.utils.log import get_task_logger
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from .tokens import *

from .models import CustomUser

logger = get_task_logger(__name__)


# This function sends a password reset email to the user.
@shared_task(name="send_password_reset_email")
def send_password_reset_email(user_id):
    try:
        user = CustomUser.objects.get(pk=user_id)
    except user.DoesNotExist:
        logger.info(f"Task send_password_reset_email has failed. Invalid User ID was sent.")
        return 0
    
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = password_reset_token.make_token(user)

    url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"

    send_email_with_context(
        subject="Obnova hesla",
        message=f"Pro obnovu hesla klikni na následující odkaz:\n{url}",
        recipients=[user.email],
    )


# This function sends an email to the user for email verification after registration.
@shared_task(name="send_email_verification")
def send_email_verification(user_id):
    try:
        user = CustomUser.objects.get(pk=user_id)
    except user.DoesNotExist:
        logger.info(f"Task send_password_reset_email has failed. Invalid User ID was sent.")
        return 0
    
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = account_activation_token.make_token(user)

    url = f"{settings.FRONTEND_URL}/email-verification/?uidb64={uid}&token={token}"

    message = f"Ověřte svůj e-mail kliknutím na odkaz:\n{url}"

    logger.debug(f"\nEMAIL OBSAH:\n {message}\nKONEC OBSAHU")

    send_email_with_context(
        recipients=user.email,
        subject="Ověření e-mailu",
        message=f"{message}"
    )


@shared_task(name="send_email_clerk_add_var_symbol")
def send_email_clerk_add_var_symbol(user_id):
    try:
        user = CustomUser.objects.get(pk=user_id)
    except user.DoesNotExist:
        logger.info(f"Task send_password_reset_email has failed. Invalid User ID was sent.")
        return 0
    
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = account_activation_token.make_token(user)
    # url = f"http://localhost:5173/clerk/add-var-symbol/{uid}/" # NEVIM
    # TODO: Replace with actual URL once frontend route is ready
    url = f"{settings.FRONTEND_URL}/clerk/add-var-symbol/{uid}/"
    message = f"Byl vytvořen nový uživatel:\n {user.firstname} {user.secondname} {user.email} .\n Doplňte variabilní symbol {url} ."

    if settings.EMAIL_BACKEND == 'django.core.mail.backends.console.EmailBackend':
        logger.debug("\nEMAIL OBSAH:\n",message, "\nKONEC OBSAHU")

    
    send_email_with_context(
        recipients=user.email,
        subject="Doplnění variabilního symbolu",
        message=message
    )


@shared_task(name="send_email_clerk_accepted")
def send_email_clerk_accepted(user_id):
    try:
        user = CustomUser.objects.get(pk=user_id)
    except user.DoesNotExist:
        logger.info(f"Task send_password_reset_email has failed. Invalid User ID was sent.")
        return 0
    
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = account_activation_token.make_token(user)

    message = f"Úředník potvrdil vaší registraci. Můžete se přihlásit."


    if settings.EMAIL_BACKEND == 'django.core.mail.backends.console.EmailBackend':
        logger.debug("\nEMAIL OBSAH:\n",message, "\nKONEC OBSAHU")
    
    send_email_with_context(
        recipients=user.email,
        subject="Úředník potvrdil váší registraci",
        message=message
    )
    
    

def send_email_with_context(recipients, subject, message):
    """
    General function to send emails with a specific context.
    """
    if isinstance(recipients, str):
        recipients = [recipients]

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=None,
            recipient_list=recipients,
            fail_silently=False,
        )
        return True
    except Exception as e:
        logger.error(f"E-mail se neodeslal: {e}")
        return False
