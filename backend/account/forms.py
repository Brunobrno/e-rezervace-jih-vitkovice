from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser  # adjust import to your app

#using: admin.py
class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ("username", "email", "role", "account_type", "password1", "password2")    

    def save(self, commit=True):
        user = super().save(commit=False)
        # Optional logic: assign role-based permissions here if needed
        if commit:
            user.save()
        return user
