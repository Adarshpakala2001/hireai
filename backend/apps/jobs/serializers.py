from rest_framework import serializers

from .models import Job


class JobSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(
        source="created_by.username",
        read_only=True,
    )

    application_count = serializers.IntegerField(
        source="applications.count",
        read_only=True,
    )

    class Meta:
        model = Job
        fields = [
            "id",
            "title",
            "department",
            "location",
            "employment_type",
            "experience_required",
            "skills",
            "description",
            "responsibilities",
            "qualifications",
            "salary_range",
            "status",
            "created_by",
            "created_by_username",
            "application_count",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "created_by",
            "created_by_username",
            "application_count",
            "created_at",
            "updated_at",
        ]