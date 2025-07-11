from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from getpass import getpass

class Command(BaseCommand):
    help = 'Vytvoří superuživatele s is_active=True a potvrzením hesla'

    def handle(self, *args, **kwargs):
        User = get_user_model()

        # Zadání údajů
        username = input("Username: ").strip()
        email = input("Email: ").strip()

        # Heslo s potvrzením
        while True:
            password = getpass("Password: ")
            password2 = getpass("Confirm password: ")
            if password != password2:
                self.stdout.write(self.style.ERROR("❌ Hesla se neshodují. Zkus to znovu."))
            elif len(password) < 6:
                self.stdout.write(self.style.ERROR("❌ Heslo musí mít alespoň 6 znaků."))
            else:
                break

        # Kontrola duplicity
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.ERROR("⚠️ Uživatel s tímto username už existuje."))
            return

        # Vytvoření uživatele
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        user.is_active = True
        if hasattr(user, 'email_verified'):
            user.email_verified = True
        user.save()

        self.stdout.write(self.style.SUCCESS(f"✅ Superuživatel '{username}' úspěšně vytvořen."))
