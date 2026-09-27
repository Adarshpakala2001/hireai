from django.urls import path

from .views import (
    CandidateProfileView,
    ResumeUploadView,
    ResumeListView,
)


urlpatterns = [
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