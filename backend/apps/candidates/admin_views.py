from django.contrib.auth import get_user_model

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsAdminOrRecruiter

from .models import CandidateProfile


User = get_user_model()


class AdminCandidateListView(generics.ListAPIView):
    """
    Recruiter/Admin endpoint for browsing candidate profiles.
    """

    permission_classes = [
        IsAuthenticated,
        IsAdminOrRecruiter,
    ]

    def get_queryset(self):
        queryset = (
            CandidateProfile.objects
            .select_related("user")
            .prefetch_related("resumes", "user__applications")
            .order_by("-updated_at")
        )

        search = self.request.query_params.get("search", "").strip()
        location = self.request.query_params.get("location", "").strip()
        skill = self.request.query_params.get("skill", "").strip()

        if search:
            queryset = queryset.filter(
                user__username__icontains=search
            ) | CandidateProfile.objects.filter(
                user__first_name__icontains=search
            ) | CandidateProfile.objects.filter(
                user__last_name__icontains=search
            ) | CandidateProfile.objects.filter(
                headline__icontains=search
            ) | CandidateProfile.objects.filter(
                summary__icontains=search
            )

        if location:
            queryset = queryset.filter(
                location__icontains=location
            )

        if skill:
            queryset = queryset.filter(
                skills__icontains=skill
            )

        return queryset.distinct()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        candidates = []

        for profile in queryset:
            user = profile.user

            candidates.append(
                {
                    "id": profile.id,
                    "user_id": user.id,
                    "username": user.username,
                    "name": (
                        user.get_full_name()
                        or user.username
                    ),
                    "email": user.email,
                    "phone": profile.phone,
                    "location": profile.location,
                    "headline": profile.headline,
                    "summary": profile.summary,
                    "skills": profile.skills,
                    "experience": profile.experience,
                    "education": profile.education,
                    "linkedin_url": profile.linkedin_url,
                    "github_url": profile.github_url,
                    "portfolio_url": profile.portfolio_url,
                    "resume_count": profile.resumes.count(),
                    "application_count": user.applications.count(),
                    "created_at": profile.created_at,
                    "updated_at": profile.updated_at,
                }
            )

        return Response(
            {
                "count": len(candidates),
                "results": candidates,
            }
        )


class AdminCandidateDetailView(APIView):
    """
    Recruiter/Admin endpoint for viewing a single candidate.
    """

    permission_classes = [
        IsAuthenticated,
        IsAdminOrRecruiter,
    ]

    def get(self, request, pk):
        try:
            profile = (
                CandidateProfile.objects
                .select_related("user")
                .prefetch_related(
                    "resumes",
                    "user__applications__job",
                    "user__applications__match_analysis",
                )
                .get(pk=pk)
            )
        except CandidateProfile.DoesNotExist:
            return Response(
                {
                    "detail": "Candidate not found."
                },
                status=404,
            )

        user = profile.user

        applications = []

        for application in user.applications.all():
            try:
                match_score = float(
                    application.match_analysis.match_score
                )
            except Exception:
                match_score = None

            applications.append(
                {
                    "id": application.id,
                    "job_id": application.job.id,
                    "job_title": application.job.title,
                    "status": application.status,
                    "match_score": match_score,
                    "applied_at": application.applied_at,
                    "updated_at": application.updated_at,
                }
            )

        resumes = []

        for resume in profile.resumes.all():
            resumes.append(
                {
                    "id": resume.id,
                    "original_filename": resume.original_filename,
                    "is_primary": resume.is_primary,
                    "uploaded_at": resume.uploaded_at,
                    "updated_at": resume.updated_at,
                }
            )

        return Response(
            {
                "id": profile.id,
                "user_id": user.id,
                "username": user.username,
                "name": (
                    user.get_full_name()
                    or user.username
                ),
                "email": user.email,
                "phone": profile.phone,
                "location": profile.location,
                "headline": profile.headline,
                "summary": profile.summary,
                "skills": profile.skills,
                "experience": profile.experience,
                "education": profile.education,
                "linkedin_url": profile.linkedin_url,
                "github_url": profile.github_url,
                "portfolio_url": profile.portfolio_url,
                "resumes": resumes,
                "applications": applications,
                "created_at": profile.created_at,
                "updated_at": profile.updated_at,
            }
        )