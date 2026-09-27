from django.conf import settings
from django.db import models

from apps.candidates.models import Resume
from apps.jobs.models import Job


class Application(models.Model):

    class Status(models.TextChoices):
        APPLIED = "APPLIED", "Applied"
        REVIEWING = "REVIEWING", "Under Review"
        SHORTLISTED = "SHORTLISTED", "Shortlisted"
        INTERVIEW = "INTERVIEW", "Interview"
        SELECTED = "SELECTED", "Selected"
        REJECTED = "REJECTED", "Rejected"

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name="applications",
    )

    candidate = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="applications",
    )

    resume = models.ForeignKey(
        Resume,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="applications",
    )

    cover_letter = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.APPLIED,
    )

    applied_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["job", "candidate"],
                name="unique_job_candidate_application",
            )
        ]
        ordering = ["-applied_at"]

    def __str__(self):
        return f"{self.candidate.username} - {self.job.title}"


class MatchAnalysis(models.Model):
    application = models.OneToOneField(
        Application,
        on_delete=models.CASCADE,
        related_name="match_analysis",
    )

    match_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
    )

    matching_skills = models.JSONField(
        default=list,
        blank=True,
    )

    missing_skills = models.JSONField(
        default=list,
        blank=True,
    )

    experience_alignment = models.CharField(
        max_length=100,
        blank=True,
    )

    strengths = models.JSONField(
        default=list,
        blank=True,
    )

    suggestions = models.JSONField(
        default=list,
        blank=True,
    )

    analysis_method = models.CharField(
        max_length=50,
        default="RULE_BASED",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return (
            f"{self.application.candidate.username} - "
            f"{self.application.job.title} - "
            f"{self.match_score}%"
        )