from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.urls import reverse
from django.core.mail import send_mail
from .tokens import *
from django.contrib.auth import get_user_model

User = get_user_model()

from django.conf import settings
from rest_framework.response import Response

# NEPOUŽIVAT -  použit Celery v account/tasks.py
import logging
logger = logging.getLogger(__name__)

# This function sends a password reset email to the user.
def send_password_reset_email(user, request):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = password_reset_token.make_token(user)

    url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"

    send_email_with_context(
        subject="Obnova hesla",
        message=f"Pro obnovu hesla klikni na následující odkaz:\n{url}",
        recipients=[user.email],
    )





# This function sends an email to the user for email verification after registration.
def send_email_verification(user):
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


def send_email_clerk_add_var_symbol(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = account_activation_token.make_token(user)
    # url = f"http://localhost:5173/clerk/add-var-symbol/{uid}/" # NEVIM
    url = f"URL"
    message = f"Byl vytvořen nový uživatel:\n {user.firstname} {user.secondname} {user.email} .\n Doplňte variabilní symbol {url} ."

    if settings.EMAIL_BACKEND == 'django.core.mail.backends.console.EmailBackend':
        logger.debug("\nEMAIL OBSAH:\n",message, "\nKONEC OBSAHU")

    
    send_email_with_context(
        recipients=user.email,
        subject="Doplnění variabilního symbolu",
        message=message
    )

def send_email_clerk_accepted(user):
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
        if settings.EMAIL_BACKEND == 'django.core.mail.backends.console.EmailBackend':
            logger.error(f"email se neodeslal... DEBUG: {e}")
            pass
        else:
            return Response({"error": f"E-mail se neodeslal, důvod: {e}"}, status=500)
