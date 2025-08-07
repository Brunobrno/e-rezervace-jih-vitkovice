from django.contrib.auth.tokens import PasswordResetTokenGenerator

# Subclass PasswordResetTokenGenerator to create a separate token generator
# for account activation. This allows future customization specific to activation tokens,
# even though it currently behaves exactly like the base class.
class AccountActivationTokenGenerator(PasswordResetTokenGenerator):
    pass  # No changes yet; inherits all behavior from PasswordResetTokenGenerator

# Create an instance of AccountActivationTokenGenerator to be used for generating
# and validating account activation tokens throughout the app.
account_activation_token = AccountActivationTokenGenerator()

# Create an instance of the base PasswordResetTokenGenerator to be used
# for password reset tokens.
password_reset_token = PasswordResetTokenGenerator()




from rest_framework_simplejwt.authentication import JWTAuthentication

#NEMĚNIT CUSTOM SBÍRANÍ COOKIE TOKENU
class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):

        raw_token = request.COOKIES.get('access_token')

        if not raw_token:
            return None
        
        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token

