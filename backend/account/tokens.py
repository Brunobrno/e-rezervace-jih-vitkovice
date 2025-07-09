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
