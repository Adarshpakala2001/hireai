from django.urls import path

from .views import (
    ApplicationListCreateView,
    ApplicationDetailView,
    ApplicationMatchAnalysisView,
    CandidateResumeAnalysisView,
)

from .admin_views import (
    AdminDashboardView,
    AdminApplicationListView,
    AdminApplicationDetailView,
    AdminApplicationStatusUpdateView,
    AdminResumeDownloadView,
)


urlpatterns = [

    # =================================================
    # CANDIDATE APPLICATIONS
    # =================================================

    path(
        "",
        ApplicationListCreateView.as_view(),
        name="application-list-create",
    ),

    path(
        "resume-analysis/",
        CandidateResumeAnalysisView.as_view(),
        name="candidate-resume-analysis",
    ),


    # =================================================
    # ADMIN / RECRUITER
    # =================================================

    path(
        "admin/dashboard/",
        AdminDashboardView.as_view(),
        name="admin-dashboard",
    ),

    path(
        "admin/",
        AdminApplicationListView.as_view(),
        name="admin-application-list",
    ),

    path(
        "admin/<int:pk>/",
        AdminApplicationDetailView.as_view(),
        name="admin-application-detail",
    ),

    path(
        "admin/<int:pk>/status/",
        AdminApplicationStatusUpdateView.as_view(),
        name="admin-application-status",
    ),
    path(
        "admin/<int:pk>/resume/download/",
        AdminResumeDownloadView.as_view(),
        name="admin-resume-download",
    ),


    # =================================================
    # CANDIDATE APPLICATION DETAIL / ANALYSIS
    # =================================================

    path(
        "<int:pk>/",
        ApplicationDetailView.as_view(),
        name="application-detail",
    ),

    path(
        "<int:pk>/analysis/",
        ApplicationMatchAnalysisView.as_view(),
        name="application-analysis",
    ),
]