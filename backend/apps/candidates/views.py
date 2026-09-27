from rest_framework import generics
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated

from apps.users.permissions import IsCandidate

from .models import CandidateProfile, Resume
from .resume_parser import extract_resume_text
from .serializers import CandidateProfileSerializer, ResumeSerializer


class CandidateProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = CandidateProfileSerializer

    permission_classes = [
        IsAuthenticated,
        IsCandidate,
    ]

    def get_object(self):
        profile, created = CandidateProfile.objects.get_or_create(
            user=self.request.user
        )

        return profile


class ResumeUploadView(generics.CreateAPIView):
    serializer_class = ResumeSerializer

    permission_classes = [
        IsAuthenticated,
        IsCandidate,
    ]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def perform_create(self, serializer):
        profile, created = CandidateProfile.objects.get_or_create(
            user=self.request.user
        )

        resume_file = self.request.FILES.get("file")

        resume = serializer.save(
            candidate=profile,
            original_filename=resume_file.name,
        )

        parsed_text = extract_resume_text(
            resume.file.path
        )

        resume.parsed_text = parsed_text
        resume.save(update_fields=["parsed_text"])

class ResumeListView(generics.ListAPIView):
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    def get_queryset(self):
        profile, created = CandidateProfile.objects.get_or_create(
            user=self.request.user
        )
        return Resume.objects.filter(candidate=profile).order_by("-uploaded_at")