from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

from .serializers import *
from .permissions import *
from .email import send_password_reset_email, send_email_verification
from .models import CustomUser
from .tokens import *
from .filters import UserFilter

from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated

from django_filters.rest_framework import DjangoFilterBackend

from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample, OpenApiParameter


User = get_user_model()

#general user view API
@extend_schema(
    tags=["User"]
)
class UserView(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = UserFilter

    # Require authentication and role permission
    permission_classes = [OnlyRolesAllowed("cityClerk", "admin")]

    class Meta:
        model = CustomUser
        extra_kwargs = {
            "email": {"help_text": "Unikátní e-mailová adresa uživatele."},
            "phone_number": {"help_text": "Telefonní číslo ve formátu +420123456789."},
            "role": {"help_text": "Role uživatele určující jeho oprávnění v systému."},
            "account_type": {"help_text": "Typ účtu – firma nebo fyzická osoba."},
            "email_verified": {"help_text": "Určuje, zda je e-mail ověřen."},
            "otc": {"help_text": "Jednorázový token k ověření nebo přihlášení."},
            "create_time": {"help_text": "Datum a čas registrace uživatele (pouze pro čtení).", "read_only": True},
            "var_symbol": {"help_text": "Variabilní symbol pro platby, pokud je vyžadován."},
            "bank_account": {"help_text": "Číslo bankovního účtu uživatele."},
            "ICO": {"help_text": "IČO firmy, pokud se jedná o firemní účet."},
            "RC": {"help_text": "Rodné číslo pro fyzické osoby."},
            "city": {"help_text": "Město trvalého pobytu / sídla."},
            "street": {"help_text": "Ulice a číslo popisné."},
            "PSC": {"help_text": "PSČ místa pobytu / sídla."},
            "GDPR": {"help_text": "Souhlas se zpracováním osobních údajů."},
            "is_active": {"help_text": "Stav aktivace uživatele.", "read_only": True},
        }
    

from rest_framework_simplejwt.views import TokenObtainPairView
# Custom Token obtaining view
@extend_schema(
    tags=["api"],
    request=CustomTokenObtainPairSerializer,
    description="Authentication - získaš Access a Refresh token... lze do <username> vložit E-mail nebo username"
)
class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

#--------------------------------------------------------------------------------------------------------------

#1. registration API
@extend_schema(
    tags=["User Registration"],
    request=UserRegistrationSerializer,
    responses={201: UserRegistrationSerializer},
    description="1. Registrace nového uživatele(firmy). Uživateli přijde email s odkazem na ověření.",
)
class UserRegistrationViewSet(ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        send_email_verification(user) # posílaní emailu pro potvrzení registrace
            
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
#2. confirming email
@extend_schema(
    tags=["User Registration"],
    responses={
        200: OpenApiResponse(description="Email úspěšně ověřen."),
        400: OpenApiResponse(description="Chybný nebo expirovaný token.")
    },
    parameters=[
        OpenApiParameter(name='uidb64', type=str, location='path', description="Token z E-mailu"),
        OpenApiParameter(name='token', type=str, location='path', description="Token uživatele"),
    ],
    description="2. Ověření emailu pomocí odkazu s uid a tokenem. (stačí jenom převzít a poslat)",
)
class EmailVerificationView(APIView):
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

#3. seller activation API (var_symbol)
@extend_schema(
    tags=["User Registration"],
    request=UserActivationSerializer,
    responses={200: UserActivationSerializer},
    description="3. Aktivace uživatele a zadání variabilního symbolu (pouze pro adminy a úředníky).",
)
class UserActivationViewSet(APIView):
    permission_classes = [OnlyRolesAllowed('cityClerk', 'admin')]

    def patch(self, request, *args, **kwargs):
        serializer = UserActivationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        send_email_clerk_accepted(user)

        return Response(serializer.to_representation(user), status=status.HTTP_200_OK)

#--------------------------------------------------------------------------------------------------------------

#1. PasswordReset + send Email
@extend_schema(
    tags=["User password reset"],
    request=PasswordResetRequestSerializer,
    responses={
        200: OpenApiResponse(description="Odeslán email s instrukcemi."),
        400: OpenApiResponse(description="Neplatný email.")
    },
    description="1(a). Požadavek na reset hesla - uživatel zadá svůj email."
)
class PasswordResetRequestView(APIView):
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            user = User.objects.get(email=serializer.validated_data['email'])
            send_password_reset_email(user, request)

            return Response({"detail": "E-mail s odkazem byl odeslán."})
        return Response(serializer.errors, status=400)
    
#2. Confirming reset
@extend_schema(
    tags=["User password reset"],
    request=PasswordResetConfirmSerializer,
    parameters=[
        OpenApiParameter(name='uidb64', type=str, location=OpenApiParameter.PATH),
        OpenApiParameter(name='token', type=str, location=OpenApiParameter.PATH),
    ],
    responses={
        200: OpenApiResponse(description="Heslo bylo změněno."),
        400: OpenApiResponse(description="Chybný token nebo data.")
    },
    description="1(a). Potvrzení resetu hesla pomocí tokenu z emailu."
)
class PasswordResetConfirmView(APIView):
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