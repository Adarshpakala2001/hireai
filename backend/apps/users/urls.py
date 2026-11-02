
from django.urls import path

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import RegisterView, MeView, GoogleAuthView


urlpatterns = [
    # Registration
    path("register/", RegisterView.as_view(), name="register"),

    # Email and password login
    path("login/", TokenObtainPairView.as_view(), name="login"),

    # JWT token refresh
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Authenticated user profile
    path("me/", MeView.as_view(), name="me"),

    # Google authentication
    path("google/", GoogleAuthView.as_view(), name="google-auth"),
]
