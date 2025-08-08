from django.shortcuts import render
from django.core.mail import send_mail
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

def index(request):
    return render(request, "html/index.html", context={'user': request.user})


@csrf_exempt
def test_mail(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    try:
        data = json.loads(request.body)
        recipient = data.get("recipient")
        if not recipient:
            return JsonResponse({"error": "Missing recipient"}, status=400)

        send_mail(
            subject="Test",
            message="Django test mail",
            from_email=None,  # použije defaultní FROM_EMAIL ze settings
            recipient_list=[recipient],
            fail_silently=False,
        )

        return JsonResponse({"success": f"E-mail sent to {recipient}"})

    except Exception as e:
        import traceback
        traceback.print_exc()  # vypíše do konzole
        return JsonResponse({"error": str(e)}, status=500)

    

