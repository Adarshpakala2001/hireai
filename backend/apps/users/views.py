
from django.conf import settings
from django.contrib.auth import get_user_model

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, UserSerializer


User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class GoogleAuthView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        credential = request.data.get("credential")

        if not credential:
            return Response(
                {"detail": "Google credential is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not settings.GOOGLE_CLIENT_ID:
            return Response(
                {"detail": "Google authentication is not configured."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Verify the Google ID token
        try:
            idinfo = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )

        except ValueError:
            return Response(
                {"detail": "Invalid or expired Google credential."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Validate verified email
        email = idinfo.get("email", "").strip().lower()

        if not email or not idinfo.get("email_verified"):
            return Response(
                {"detail": "A verified Google email address is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        first_name = idinfo.get("given_name", "")
        last_name = idinfo.get("family_name", "")

        # Find an existing account using the verified email
        user = User.objects.filter(email__iexact=email).first()

        if user is None:
            # Generate a unique username from the email address
            base_username = email.split("@")[0]
            username = base_username
            counter = 1

            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            # Create a new candidate account
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                role=User.Role.CANDIDATE,
            )

            user.set_unusable_password()
            user.save(update_fields=["password"])

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )
