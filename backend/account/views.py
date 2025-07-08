from django.contrib.auth import get_user_model
from .serializers import *

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView

User = get_user_model()

class MyModelViewSet(viewsets.ModelViewSet):
    """
    Provides CRUD operations for MyModel.

    - Uses MyModelSerializer to handle serialization and validation.
    - Restricts access to authenticated users with specific roles.
    """

    queryset = MyModel.objects.all()  # all objects, customize with filters if needed
    serializer_class = MyModelSerializer

    # Require authentication and role permission
    permission_classes = [IsAuthenticated, IsRoleAllowed]
    
    
class CreateUserWithTokenView(generics.GenericAPIView):
    serializer_class = CreateUserWithTokenSerializer
    permission_classes = [permissions.IsAuthenticated]  # Only office workers

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.save()

        user = data['user']
        token = data['login_token']

        # Here you’d normally email the link to user or return link in response
        login_url = f"https://yourfrontend.com/login-with-token/{token}"

        return Response({
            'username': user.username,
            'email': user.email,
            'login_url': login_url
        }, status=status.HTTP_201_CREATED)
    

class OneTimeLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token_value = request.data.get('token')

        try:
            token_obj = OneTimeLoginToken.objects.get(token=token_value)
        except OneTimeLoginToken.DoesNotExist:
            return Response({'detail': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

        if not token_obj.is_valid():
            return Response({'detail': 'Token expired or already used'}, status=status.HTTP_400_BAD_REQUEST)

        user = token_obj.user

        # Invalidate the token
        token_obj.used = True
        token_obj.save()

        # Create JWT tokens for user
        refresh = RefreshToken.for_user(user)

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'username': user.username,
                'email': user.email,
                'role': user.role,
            }
        })
    
"""
{
    "username": "yourusername",
    "password": "yourpassword"
}
response:
{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqd...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhb..."
}
"""
'''
{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqd..."
}
response:
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhb..."
}

'''