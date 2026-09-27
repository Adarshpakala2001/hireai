from django.urls import path

from .views import (
    ApplicationListCreateView,
    ApplicationDetailView,
    ApplicationMatchAnalysisView,
)

urlpatterns = [
    path(
        "",
        ApplicationListCreateView.as_view(),
        name="application-list-create",
    ),
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