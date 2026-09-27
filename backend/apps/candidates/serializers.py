from rest_framework import serializers

from .models import CandidateProfile, Resume


class CandidateProfileSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    class Meta:
        model = CandidateProfile
        fields = [
            "id",
            "user",
            "username",
            "phone",
            "location",
            "headline",
            "summary",
            "skills",
            "experience",
            "education",
            "linkedin_url",
            "github_url",
            "portfolio_url",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "username",
            "created_at",
            "updated_at",
        ]


class ResumeSerializer(serializers.ModelSerializer):

    candidate_username = serializers.CharField(
        source="candidate.user.username",
        read_only=True,
    )

    def validate_file(self, value):
        max_size = 5 * 1024 * 1024  # 5 MB

        if value.size > max_size:
            raise serializers.ValidationError(
                "Resume file size must not exceed 5 MB."
            )

        return value

    class Meta:
        model = Resume
        fields = [
            "id",
            "candidate",
            "candidate_username",
            "file",
            "original_filename",
            "parsed_text",
            "is_primary",
            "uploaded_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "candidate",
            "candidate_username",
            "original_filename",
            "parsed_text",
            "uploaded_at",
            "updated_at",
        ]