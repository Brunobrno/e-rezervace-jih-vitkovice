from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.urls import reverse
from django.core.mail import send_mail
from .tokens import *

def send_password_reset_email(user, request):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = password_reset_token.make_token(user)

    reset_url = request.build_absolute_uri(
        reverse("reset-password-confirm", kwargs={"uidb64": uid, "token": token})
    )

    send_mail(
        subject="Obnova hesla",
        message=f"Pro obnovu hesla klikni na následující odkaz:\n{reset_url}",
        from_email=None,
        recipient_list=[user.email],
        fail_silently=False,
    )

def send_email_verification(user, request):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = account_activation_token.make_token(user)

    url = f"http://localhost:5173/email-verification/?uidb64={uid}&token={token}"

    message = f"Ověřte svůj e-mail kliknutím na odkaz:\n{url}"
    print("\nEMAIL OBSAH:\n",message, "\nKONEC OBSAHU")

    send_mail(
        subject="Ověření e-mailu",
        message=message,
        from_email=None,
        recipient_list=[user.email],
        fail_silently=False,
    )