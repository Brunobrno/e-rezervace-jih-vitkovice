from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

from .serializers import *
from .permissions import *
from .email import send_password_reset_email, send_email_verification
from .models import CustomUser
from .tokens import *

from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi



User = get_user_model()

#general user view API
class UserView(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    # Require authentication and role permission
    permission_classes = [IsAuthenticated, IsOfficer, IsAdmin]
    


#1. registration API
class UserRegistrationViewSet(ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    http_method_names = ['post']

    @swagger_auto_schema(
        operation_description="Registrace nového uživatele. Uživateli přijde email s odkazem na ověření.",
        responses={201: UserRegistrationSerializer}
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
#2. confirming email
class EmailVerificationView(APIView):
    @swagger_auto_schema(
        operation_description="Ověření emailu pomocí odkazu s uid a tokenem.",
        responses={
            200: openapi.Response(description="Email úspěšně ověřen."),
            400: openapi.Response(description="Chybný nebo expirovaný token.")
        }
    )
    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({"error": "Neplatný odkaz."}, status=400)

        if account_activation_token.check_token(user, token):
            user.email_verified = True
            user.save()
            return Response({"detail": "E-mail byl úspěšně ověřen. Účet čeká na schválení."})
        else:
            return Response({"error": "Token je neplatný nebo expirovaný."}, status=400)

#3. seller activation API
class UserActivationViewSet(ModelViewSet):
    queryset = CustomUser.objects.filter(is_active=False)
    serializer_class = UserActivationSerializer
    permission_classes = [IsAuthenticated, IsAdmin, IsOfficer]
    http_method_names = ['patch']

    @swagger_auto_schema(
        operation_description="Aktivace uživatele a zadání variabilního symbolu (pouze pro adminy a úředníky).",
        request_body=UserActivationSerializer,
        responses={200: UserActivationSerializer}
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

#--------------------------------------------------------------------------------------------------------------

#1. PasswordReset + send Email
class PasswordResetRequestView(APIView):
    @swagger_auto_schema(
        operation_description="Požadavek na reset hesla - uživatel zadá svůj email.",
        request_body=PasswordResetRequestSerializer,
        responses={200: "Odeslán email s instrukcemi.", 400: "Neplatný email."}
    )
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            user = User.objects.get(email=serializer.validated_data['email'])
            send_password_reset_email(user, request)

            return Response({"detail": "E-mail s odkazem byl odeslán."})
        return Response(serializer.errors, status=400)
    
#2. Confirming reset
class PasswordResetConfirmView(APIView):
    @swagger_auto_schema(
        operation_description="Potvrzení resetu hesla pomocí tokenu z emailu.",
        request_body=PasswordResetConfirmSerializer,
        responses={200: "Heslo bylo změněno.", 400: "Chybný token nebo data."}
    )
    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Neplatný odkaz."}, status=400)

        if not password_reset_token.check_token(user, token):
            return Response({"error": "Token je neplatný nebo expirovaný."}, status=400)

        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            user.set_password(serializer.validated_data['password'])
            user.save()
            return Response({"detail": "Heslo bylo úspěšně změněno."})
        return Response(serializer.errors, status=400)
    
