from django.conf import settings
from django.core.validators import FileExtensionValidator
from django.db import models


class CandidateProfile(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="candidate_profile",
    )

    phone = models.CharField(
        max_length=20,
        blank=True,
    )

    location = models.CharField(
        max_length=150,
        blank=True,
    )

    headline = models.CharField(
        max_length=200,
        blank=True,
    )

    summary = models.TextField(
        blank=True,
    )

    skills = models.TextField(
        blank=True,
        help_text="Comma-separated skills, e.g. Python, Django, SQL",
    )

    experience = models.TextField(
        blank=True,
    )

    education = models.TextField(
        blank=True,
    )

    linkedin_url = models.URLField(
        blank=True,
    )

    github_url = models.URLField(
        blank=True,
    )

    portfolio_url = models.URLField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return f"{self.user.username} - Candidate Profile"


class Resume(models.Model):

    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name="resumes",
    )

    file = models.FileField(
        upload_to="resumes/%Y/%m/",
        validators=[
            FileExtensionValidator(
                allowed_extensions=["pdf", "docx"]
            )
        ],
    )

    original_filename = models.CharField(
        max_length=255,
        blank=True,
    )

    parsed_text = models.TextField(
        blank=True,
    )

    is_primary = models.BooleanField(
        default=False,
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return f"{self.candidate.user.username} - {self.original_filename}"