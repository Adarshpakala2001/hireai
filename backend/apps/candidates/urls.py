from django.urls import path

from .admin_views import (
    AdminCandidateListView,
    AdminCandidateDetailView,
)

from .views import (
    CandidateProfileView,
    ResumeUploadView,
    ResumeListView,
)


urlpatterns = [

    path(
        "admin/",
        AdminCandidateListView.as_view(),
        name="admin-candidate-list",
    ),
    path(
        "admin/<int:pk>/",
        AdminCandidateDetailView.as_view(),
        name="admin-candidate-detail",
    ),
    path(
        "profile/",
        CandidateProfileView.as_view(),
        name="candidate-profile",
    ),
    path(
        "resumes/",
        ResumeUploadView.as_view(),
        name="resume-upload",
    ),
    path("resumes/list/", ResumeListView.as_view(), name="resume-list"),
]