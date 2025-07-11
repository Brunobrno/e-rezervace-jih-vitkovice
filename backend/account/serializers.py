from django.contrib.auth.models import Group
from rest_framework import serializers
from django.contrib.auth import get_user_model

from .permissions import *
from .email import *

from rest_framework.decorators import action
from rest_framework.response import Response


User = get_user_model()


from .models import OneTimeLoginToken

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'  # Všechny fieldy z modelu User



# serializers.py

from rest_framework import serializers
from django.utils.text import slugify
from django.contrib.auth import get_user_model
import unicodedata
import re

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        help_text="Heslo musí mít alespoň 8 znaků, obsahovat velká a malá písmena a číslici."
    )

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'email', 'phone_number',
            'password', 'role', 'city', 'street', 'PSC'
        ]

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Heslo musí mít alespoň 8 znaků.")
        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError("Heslo musí obsahovat alespoň jedno velké písmeno.")
        if not re.search(r"[a-z]", value):
            raise serializers.ValidationError("Heslo musí obsahovat alespoň jedno malé písmeno.")
        if not re.search(r"\d", value):
            raise serializers.ValidationError("Heslo musí obsahovat alespoň jednu číslici.")
        return value

    def validate(self, data):
        email = data.get("email")
        phone = data.get("phone_number")
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "Účet s tímto emailem již existuje."})
        if phone and User.objects.filter(phone_number=phone).exists():
            raise serializers.ValidationError({"phone_number": "Účet s tímto telefonem již existuje."})
        return data

    def generate_username(self, first_name, last_name):
        # Převod na ascii (bez diakritiky)
        base_login = slugify(f"{last_name}{first_name[:2]}")
        login = base_login
        counter = 1
        while User.objects.filter(username=login).exists():
            login = f"{base_login}{counter}"
            counter += 1
        return login
    
    

    def create(self, validated_data):
        password = validated_data.pop("password")
        first_name = validated_data.get("first_name", "")
        last_name = validated_data.get("last_name", "")
        username = self.generate_username(first_name, last_name)
        user = User.objects.create(
            username=username,
            is_active=False, #uživatel je defaultně deaktivovaný
            **validated_data
        )
        user.set_password(password)
        user.save()

        request = self.context.get("request")
        if request:
            send_email_verification(user, request)

        return user
    
class UserActivationSerializer(serializers.ModelSerializer):
    var_symbol = serializers.IntegerField(
        help_text="Variabilní symbol, který musí být doplněn úředníkem pro aktivaci účtu."
    )

    class Meta:
        model = User
        fields = ['var_symbol']

    def update(self, instance, validated_data):
        instance.var_symbol = validated_data['var_symbol']
        instance.is_active = True
        instance.save()
        return instance
# user creating section end --------------------------------------------


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(
        help_text="E-mail registrovaného a aktivního uživatele, na který bude zaslán reset hesla."
    )

    def validate_email(self, value):
        if not User.objects.filter(email=value, is_active=True).exists():
            raise serializers.ValidationError("Účet s tímto emailem neexistuje nebo není aktivní.")
        return value
    
class PasswordResetConfirmSerializer(serializers.Serializer):
    password = serializers.CharField(
        write_only=True,
        help_text="Nové heslo musí mít alespoň 8 znaků, obsahovat velká a malá písmena a číslici."
    )

    def validate_password(self, value):
        import re
        if len(value) < 8:
            raise serializers.ValidationError("Heslo musí mít alespoň 8 znaků.")
        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError("Musí obsahovat velké písmeno.")
        if not re.search(r"[a-z]", value):
            raise serializers.ValidationError("Musí obsahovat malé písmeno.")
        if not re.search(r"\d", value):
            raise serializers.ValidationError("Musí obsahovat číslici.")
        return value