
from rest_framework import serializers

from .models import Application, MatchAnalysis


# =====================================================
# CANDIDATE APPLICATION SERIALIZER
# =====================================================

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


# =====================================================
# CANDIDATE MATCH ANALYSIS SERIALIZER
# =====================================================

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
# ADMIN / RECRUITER APPLICATION SERIALIZER
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

    # AI Match Analysis fields
    match_score = serializers.SerializerMethodField()

    matching_skills = serializers.SerializerMethodField()

    missing_skills = serializers.SerializerMethodField()

    experience_alignment = serializers.SerializerMethodField()

    strengths = serializers.SerializerMethodField()

    suggestions = serializers.SerializerMethodField()

    analysis_method = serializers.SerializerMethodField()

    class Meta:
        model = Application

        fields = [
            "id",
            "job",
            "job_title",

            # Candidate information
            "candidate",
            "candidate_name",
            "candidate_username",
            "candidate_email",

            # Resume information
            "resume",
            "resume_filename",
            "resume_text",
            "resume_url",

            # Application information
            "cover_letter",
            "status",

            # AI analysis information
            "match_score",
            "matching_skills",
            "missing_skills",
            "experience_alignment",
            "strengths",
            "suggestions",
            "analysis_method",

            # Timestamps
            "applied_at",
            "updated_at",
        ]

        read_only_fields = fields

    # -------------------------------------------------
    # CANDIDATE INFORMATION
    # -------------------------------------------------

    def get_candidate_name(self, obj):
        return (
            obj.candidate.get_full_name()
            or obj.candidate.username
        )

    # -------------------------------------------------
    # RESUME INFORMATION
    # -------------------------------------------------

    def get_resume_url(self, obj):

        if not obj.resume or not obj.resume.file:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(
                obj.resume.file.url
            )

        return obj.resume.file.url

    # -------------------------------------------------
    # AI ANALYSIS HELPER
    # -------------------------------------------------

    def get_analysis_value(self, obj, field, default=None):
        """
        Safely retrieve AI analysis values.

        Returns a default value when an application
        does not have an associated MatchAnalysis.
        """

        try:
            analysis = obj.match_analysis

        except MatchAnalysis.DoesNotExist:
            return default

        return getattr(
            analysis,
            field,
            default,
        )

    # -------------------------------------------------
    # AI MATCH SCORE
    # -------------------------------------------------

    def get_match_score(self, obj):

        score = self.get_analysis_value(
            obj,
            "match_score",
            None,
        )

        if score is None:
            return None

        return float(score)

    # -------------------------------------------------
    # MATCHING SKILLS
    # -------------------------------------------------

    def get_matching_skills(self, obj):

        return self.get_analysis_value(
            obj,
            "matching_skills",
            [],
        )

    # -------------------------------------------------
    # MISSING SKILLS
    # -------------------------------------------------

    def get_missing_skills(self, obj):

        return self.get_analysis_value(
            obj,
            "missing_skills",
            [],
        )

    # -------------------------------------------------
    # EXPERIENCE ALIGNMENT
    # -------------------------------------------------

    def get_experience_alignment(self, obj):

        return self.get_analysis_value(
            obj,
            "experience_alignment",
            "",
        )

    # -------------------------------------------------
    # STRENGTHS
    # -------------------------------------------------

    def get_strengths(self, obj):

        return self.get_analysis_value(
            obj,
            "strengths",
            [],
        )

    # -------------------------------------------------
    # SUGGESTIONS
    # -------------------------------------------------

    def get_suggestions(self, obj):

        return self.get_analysis_value(
            obj,
            "suggestions",
            [],
        )

    # -------------------------------------------------
    # ANALYSIS METHOD
    # -------------------------------------------------

    def get_analysis_method(self, obj):

        return self.get_analysis_value(
            obj,
            "analysis_method",
            "",
        )


# =====================================================
# ADMIN / RECRUITER APPLICATION STATUS SERIALIZER
# =====================================================

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
