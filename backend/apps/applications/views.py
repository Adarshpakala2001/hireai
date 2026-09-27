from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound

from apps.users.permissions import IsCandidate

from .models import Application
from .serializers import (
    ApplicationSerializer,
    MatchAnalysisSerializer,
)
from .match_engine import save_match_analysis


class ApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [
        IsAuthenticated,
        IsCandidate,
    ]

    def get_queryset(self):
        return Application.objects.filter(
            candidate=self.request.user
        ).select_related(
            "job",
            "resume",
        )

    def perform_create(self, serializer):
        serializer.save(
            candidate=self.request.user
        )


class ApplicationDetailView(generics.RetrieveAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [
        IsAuthenticated,
        IsCandidate,
    ]

    def get_queryset(self):
        return Application.objects.filter(
            candidate=self.request.user
        ).select_related(
            "job",
            "resume",
        )

class ApplicationMatchAnalysisView(generics.RetrieveAPIView):
    serializer_class = MatchAnalysisSerializer
    permission_classes = [
        IsAuthenticated,
        IsCandidate,
    ]

    def get_object(self):
        application_id = self.kwargs["pk"]

        try:
            application = Application.objects.select_related(
                "job",
                "resume",
            ).get(
                id=application_id,
                candidate=self.request.user,
            )
        except Application.DoesNotExist:
            raise NotFound(
                "Application not found."
            )

        if not application.resume:
            raise NotFound(
                "This application does not have a resume."
            )

        match_analysis, created = save_match_analysis(
            application
        )

        return match_analysis