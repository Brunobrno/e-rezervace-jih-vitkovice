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
@shared_task
def send_password_reset_email_task(user_id):
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
@shared_task
def send_email_verification_task(user_id):
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


@shared_task
def send_email_clerk_add_var_symbol_task(user_id):
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

    send_email_with_context(
        recipients=user.email,
        subject="Doplnění variabilního symbolu",
        message=message
    )


@shared_task
def send_email_clerk_accepted_task(user_id):
    try:
        user = CustomUser.objects.get(pk=user_id)
    except user.DoesNotExist:
        logger.info(f"Task send_password_reset_email has failed. Invalid User ID was sent.")
        return 0
    
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = account_activation_token.make_token(user)

    message = f"Úředník potvrdil vaší registraci. Můžete se přihlásit."
    
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
        if settings.EMAIL_BACKEND == 'django.core.mail.backends.console.EmailBackend':
            logger.debug("\nEMAIL OBSAH:\n%s\nKONEC OBSAHU", message)
        return True
    except Exception as e:
        logger.error(f"E-mail se neodeslal: {e}")
        return False
