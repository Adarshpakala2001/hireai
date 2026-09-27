from rest_framework import serializers

from .models import Application, MatchAnalysis


class ApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(
        source="job.title",
        read_only=True,
    )

    candidate_username = serializers.CharField(
        source="candidate.username",
        read_only=True,
    )

    resume_filename = serializers.CharField(
        source="resume.original_filename",
        read_only=True,
    )

    class Meta:
        model = Application
        fields = [
            "id",
            "job",
            "job_title",
            "candidate",
            "candidate_username",
            "resume",
            "resume_filename",
            "cover_letter",
            "status",
            "applied_at",
            "updated_at",
        ]

        read_only_fields = [
            "candidate",
            "status",
            "applied_at",
            "updated_at",
        ]

    def validate_resume(self, resume):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        if resume.candidate.user != request.user:
            raise serializers.ValidationError(
                "You can only apply using your own resume."
            )

        return resume

    def validate_job(self, job):
        if job.status != "OPEN":
            raise serializers.ValidationError(
                "You can only apply to open jobs."
            )

        return job

    def validate(self, attrs):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        job = attrs.get("job")

        if Application.objects.filter(
            job=job,
            candidate=request.user,
        ).exists():
            raise serializers.ValidationError(
                "You have already applied to this job."
            )

        return attrs

class MatchAnalysisSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(
        source="application.job.title",
        read_only=True,
    )

    application_id = serializers.IntegerField(
        source="application.id",
        read_only=True,
    )

    class Meta:
        model = MatchAnalysis

        fields = [
            "id",
            "application_id",
            "job_title",
            "match_score",
            "matching_skills",
            "missing_skills",
            "experience_alignment",
            "strengths",
            "suggestions",
            "analysis_method",
            "created_at",
            "updated_at",
        ]

        read_only_fields = fields