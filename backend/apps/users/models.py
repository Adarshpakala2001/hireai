
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        RECRUITER = "RECRUITER", "Recruiter"
        CANDIDATE = "CANDIDATE", "Candidate"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CANDIDATE,
    )

    company_name = models.CharField(
        max_length=255,
        blank=True,
    )

    designation = models.CharField(
        max_length=255,
        blank=True,
    )

    def __str__(self):
        return f"{self.username} ({self.role})"
