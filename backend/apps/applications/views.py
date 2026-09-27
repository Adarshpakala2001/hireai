from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsCandidate

from apps.candidates.models import Resume
from apps.jobs.models import Job

from .match_engine import build_match_analysis, save_match_analysis
from .models import Application
from .serializers import ApplicationSerializer, MatchAnalysisSerializer


class ApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [
        IsAuthenticated,
        IsCandidate,
    ]

    def get_queryset(self):
        return (
            Application.objects
            .filter(candidate=self.request.user)
            .select_related("job", "resume")
        )

    def perform_create(self, serializer):
        serializer.save(candidate=self.request.user)


class ApplicationDetailView(generics.RetrieveAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [
        IsAuthenticated,
        IsCandidate,
    ]

    def get_queryset(self):
        return (
            Application.objects
            .filter(candidate=self.request.user)
            .select_related("job", "resume")
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
            application = (
                Application.objects
                .select_related("job", "resume")
                .get(
                    id=application_id,
                    candidate=self.request.user,
                )
            )
        except Application.DoesNotExist:
            from rest_framework.exceptions import NotFound

            raise NotFound("Application not found.")

        if not application.resume:
            from rest_framework.exceptions import NotFound

            raise NotFound(
                "This application does not have a resume."
            )

        match_analysis, created = save_match_analysis(
            application
        )

        return match_analysis


class CandidateResumeAnalysisView(APIView):
    """
    Analyze a candidate's resume against an open job
    without requiring an application.
    """

    permission_classes = [
        IsAuthenticated,
        IsCandidate,
    ]

    def post(self, request):
        resume_id = request.data.get("resume_id")
        job_id = request.data.get("job_id")

        if not resume_id:
            return Response(
                {
                    "detail": "resume_id is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not job_id:
            return Response(
                {
                    "detail": "job_id is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            resume = (
                Resume.objects
                .select_related("candidate__user")
                .get(
                    id=resume_id,
                    candidate__user=request.user,
                )
            )
        except Resume.DoesNotExist:
            return Response(
                {
                    "detail": "Resume not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            job = Job.objects.get(
                id=job_id,
                status=Job.Status.OPEN,
            )
        except Job.DoesNotExist:
            return Response(
                {
                    "detail": "Open job not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        analysis = build_match_analysis(
            job,
            resume,
        )

        return Response(
            {
                "job_id": job.id,
                "job_title": job.title,
                "resume_id": resume.id,
                "resume_filename": resume.original_filename,
                **analysis,
            },
            status=status.HTTP_200_OK,
        )