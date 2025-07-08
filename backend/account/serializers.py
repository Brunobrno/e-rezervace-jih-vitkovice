from django.contrib.auth.models import Group
from rest_framework import serializers
from django.contrib.auth import get_user_model

from permissions import *

from rest_framework.decorators import action
from rest_framework.response import Response


User = get_user_model()


from .models import OneTimeLoginToken

class CreateUserWithTokenSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    role = serializers.CharField(default='seller')

    def create(self, validated_data):
        password = User.objects.make_random_password()
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            role=validated_data.get('role', 'customer'),
        )
        user.set_password(password)  # set random password
        user.save()

        token = OneTimeLoginToken.objects.create(user=user)
        return {
            'user': user,
            'login_token': token.token
        }