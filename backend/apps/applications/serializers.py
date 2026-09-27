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

        if (
            not request
            or not request.user.is_authenticated
        ):
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

        if (
            not request
            or not request.user.is_authenticated
        ):
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


class MatchAnalysisSerializer(
    serializers.ModelSerializer
):
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


# =====================================================
# ADMIN / RECRUITER SERIALIZERS
# =====================================================

class AdminApplicationSerializer(
    serializers.ModelSerializer
):
    job_title = serializers.CharField(
        source="job.title",
        read_only=True,
    )

    candidate_name = serializers.SerializerMethodField()

    candidate_username = serializers.CharField(
        source="candidate.username",
        read_only=True,
    )

    candidate_email = serializers.EmailField(
        source="candidate.email",
        read_only=True,
    )

    resume_filename = serializers.CharField(
        source="resume.original_filename",
        read_only=True,
        allow_null=True,
    )

    resume_text = serializers.CharField(
        source="resume.parsed_text",
        read_only=True,
        allow_null=True,
    )

    resume_url = serializers.SerializerMethodField()

    match_score = serializers.SerializerMethodField()

    class Meta:
        model = Application

        fields = [
            "id",
            "job",
            "job_title",
            "candidate",
            "candidate_name",
            "candidate_username",
            "candidate_email",
            "resume",
            "resume_filename",
            "resume_text",
            "resume_url",
            "cover_letter",
            "status",
            "match_score",
            "applied_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "job",
            "job_title",
            "candidate",
            "candidate_name",
            "candidate_username",
            "candidate_email",
            "resume",
            "resume_filename",
            "resume_url",
            "cover_letter",
            "match_score",
            "applied_at",
            "updated_at",
        ]

    def get_candidate_name(self, obj):
        return (
            obj.candidate.get_full_name()
            or obj.candidate.username
        )

    def get_resume_url(self, obj):
        if not obj.resume or not obj.resume.file:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(
                obj.resume.file.url
            )

        return obj.resume.file.url

    def get_match_score(self, obj):
        try:
            return float(
                obj.match_analysis.match_score
            )
        except MatchAnalysis.DoesNotExist:
            return None


class AdminApplicationStatusSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = Application

        fields = [
            "status",
        ]

    def validate_status(self, value):
        valid_statuses = {
            choice[0]
            for choice in Application.Status.choices
        }

        if value not in valid_statuses:
            raise serializers.ValidationError(
                "Invalid application status."
            )

        return value