from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.response import Response

from .email import send_email_with_context

@shared_task
def send_email_with_context_task(recipients=[], subject="", message=""):
    """
    General function to send emails with a specific context.
    """
    print("in celery task")

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
        print("email was sent")
        return True
    except Exception as e:
        if settings.EMAIL_BACKEND == 'django.core.mail.backends.console.EmailBackend':
            print(f"email se neodeslal... DEBUG: {e}")
            pass
        else:
            return Response({"error": f"E-mail se neodeslal, důvod: {e}"}, status=500)
        

    # send_mail(
    #     "Welcome!",
    #     "Thank you for registering.",
    #     "from@example.com",
    #     [],
    #     fail_silently=False,
    # )