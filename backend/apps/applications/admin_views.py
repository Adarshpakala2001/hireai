
from django.contrib.auth import get_user_model
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.db.models import Q

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsAdminOrRecruiter
from apps.jobs.models import Job

from .models import Application
from .match_engine import save_match_analysis
from .serializers import (
    AdminApplicationSerializer,
    AdminApplicationStatusSerializer,
)


User = get_user_model()


def get_recruiter_jobs(user):
    """
    ADMIN can access all jobs.
    RECRUITER can access only jobs created by that recruiter.
    """
    queryset = Job.objects.all()

    if user.role == User.Role.RECRUITER:
        queryset = queryset.filter(created_by=user)

    return queryset


def get_recruiter_applications(user):
    """
    ADMIN can access all applications.
    RECRUITER can access applications for their own jobs.
    """
    queryset = Application.objects.all()

    if user.role == User.Role.RECRUITER:
        queryset = queryset.filter(job__created_by=user)

    return queryset


# =====================================================
# ADMIN / RECRUITER DASHBOARD
# =====================================================

class AdminDashboardView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsAdminOrRecruiter,
    ]

    def get(self, request):

        jobs = get_recruiter_jobs(request.user)

        applications = (
            get_recruiter_applications(request.user)
        )

        open_jobs = jobs.filter(
            status=Job.Status.OPEN
        ).count()

        total_jobs = jobs.count()

        total_applications = applications.count()

        if request.user.role == User.Role.RECRUITER:
            total_candidates = (
                applications
                .values("candidate_id")
                .distinct()
                .count()
            )
        else:
            total_candidates = User.objects.filter(
                role=User.Role.CANDIDATE
            ).count()

        interviews = applications.filter(
            status=Application.Status.INTERVIEW
        ).count()

        selected = applications.filter(
            status=Application.Status.SELECTED
        ).count()

        recent_applications = (
            applications
            .select_related(
                "candidate",
                "job",
            )
            .order_by("-applied_at")[:5]
        )

        recent_jobs = (
            jobs
            .select_related("created_by")
            .prefetch_related("applications")
            .order_by("-created_at")[:5]
        )

        application_data = []

        for application in recent_applications:

            application_data.append({
                "id": application.id,

                "candidate_name": (
                    application.candidate.get_full_name()
                    or application.candidate.username
                ),

                "candidate_username": (
                    application.candidate.username
                ),

                "job_title": application.job.title,

                "status": application.status,

                "applied_at": application.applied_at,
            })

        job_data = []

        for job in recent_jobs:

            job_data.append({
                "id": job.id,
                "title": job.title,
                "department": job.department,
                "location": job.location,
                "employment_type": job.employment_type,
                "status": job.status,
                "application_count": job.applications.count(),
                "created_at": job.created_at,
            })

        return Response(
            {
                "statistics": {
                    "open_jobs": open_jobs,
                    "total_jobs": total_jobs,
                    "total_applications": total_applications,
                    "total_candidates": total_candidates,
                    "interviews": interviews,
                    "selected": selected,
                },

                "recent_applications": application_data,

                "recent_jobs": job_data,
            },

            status=status.HTTP_200_OK,
        )


# =====================================================
# ADMIN / RECRUITER APPLICATION LIST
# =====================================================

class AdminApplicationListView(generics.ListAPIView):
    serializer_class = AdminApplicationSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdminOrRecruiter,
    ]

    def get_queryset(self):

        queryset = (
            get_recruiter_applications(self.request.user)
            .select_related(
                "candidate",
                "job",
                "resume",
                "resume__candidate",
                "match_analysis",
            )
            .order_by("-applied_at")
        )

        status_filter = self.request.query_params.get(
            "status"
        )

        job_id = self.request.query_params.get("job")

        search = self.request.query_params.get("search")

        if status_filter:
            queryset = queryset.filter(
                status=status_filter
            )

        if job_id:
            queryset = queryset.filter(
                job_id=job_id
            )

        if search:
            queryset = queryset.filter(
                Q(candidate__username__icontains=search)
                | Q(candidate__first_name__icontains=search)
                | Q(candidate__last_name__icontains=search)
                | Q(candidate__email__icontains=search)
                | Q(job__title__icontains=search)
            )

        return queryset


# =====================================================
# ADMIN / RECRUITER APPLICATION DETAIL
# =====================================================

class AdminApplicationDetailView(generics.RetrieveAPIView):
    serializer_class = AdminApplicationSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdminOrRecruiter,
    ]

    def get_queryset(self):

        return (
            get_recruiter_applications(self.request.user)
            .select_related(
                "candidate",
                "job",
                "resume",
                "resume__candidate",
                "match_analysis",
            )
        )

    def retrieve(self, request, *args, **kwargs):

        application = self.get_object()

        if application.resume:
            save_match_analysis(application)

            application.refresh_from_db()

        serializer = self.get_serializer(application)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


# =====================================================
# ADMIN / RECRUITER APPLICATION STATUS UPDATE
# =====================================================

class AdminApplicationStatusUpdateView(generics.UpdateAPIView):
    serializer_class = AdminApplicationStatusSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdminOrRecruiter,
    ]

    http_method_names = ["patch"]

    def get_queryset(self):
        return get_recruiter_applications(
            self.request.user
        )

    def update(self, request, *args, **kwargs):

        application = self.get_object()

        serializer = self.get_serializer(
            application,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)

        serializer.save()

        return Response(
            {
                "message": (
                    "Application status updated successfully."
                ),

                "application": AdminApplicationSerializer(
                    application,
                    context={"request": request},
                ).data,
            },

            status=status.HTTP_200_OK,
        )


# =====================================================
# ADMIN / RECRUITER RESUME DOWNLOAD
# =====================================================

class AdminResumeDownloadView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsAdminOrRecruiter,
    ]

    def get(self, request, pk):

        applications = (
            get_recruiter_applications(request.user)
            .select_related("resume", "job")
        )

        application = get_object_or_404(
            applications,
            pk=pk,
        )

        if not application.resume:
            return Response(
                {
                    "detail": (
                        "This application does not have a resume."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        resume = application.resume

        if not resume.file:
            return Response(
                {
                    "detail": "Resume file is unavailable."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            file_handle = resume.file.open("rb")

        except (FileNotFoundError, OSError, ValueError):
            return Response(
                {
                    "detail": "Resume file could not be found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        return FileResponse(
            file_handle,
            as_attachment=True,
            filename=(
                resume.original_filename
                or "candidate_resume"
            ),
        )
