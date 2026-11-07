
from django.urls import path

from .views import (
    LoginView,
    LogoutView,
    CurrentUserView,
    UserRegistrationView,
)


urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path("register/", UserRegistrationView.as_view(), name="register"),
]
