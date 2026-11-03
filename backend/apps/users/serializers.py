
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    password2 = serializers.CharField(
        write_only=True,
    )

    # Public registration permits only Candidate and Recruiter.
    # ADMIN accounts must be created through a trusted admin process.
    role = serializers.ChoiceField(
        choices=[
            (User.Role.CANDIDATE, "Candidate"),
            (User.Role.RECRUITER, "Recruiter"),
        ],
        required=False,
        default=User.Role.CANDIDATE,
    )

    company_name = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
    )

    designation = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "password2",
            "role",
            "company_name",
            "designation",
        ]

    def validate(self, attrs):

        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({
                "password": "Passwords do not match."
            })

        if attrs["role"] == User.Role.RECRUITER:

            if not attrs.get("company_name", "").strip():
                raise serializers.ValidationError({
                    "company_name": "Company name is required."
                })

            if not attrs.get("designation", "").strip():
                raise serializers.ValidationError({
                    "designation": "Designation is required."
                })

        return attrs

    def create(self, validated_data):

        validated_data.pop("password2")

        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            **validated_data,
        )

        return user


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "company_name",
            "designation",
        ]
