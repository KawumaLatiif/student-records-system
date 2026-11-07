
"""
URL configuration for the Student Records Management System.
"""

from django.contrib import admin
from django.urls import path, include


urlpatterns = [
    # Django administration
    path("admin/", admin.site.urls),

    # Student management API
    path("api/", include("students.urls")),

    # User authentication API
    path("api/accounts/", include("accounts.urls")),

    # Django REST Framework browsable authentication
    path("api-auth/", include("rest_framework.urls")),
]
