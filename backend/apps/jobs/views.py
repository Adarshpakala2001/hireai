
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from apps.users.permissions import IsAdminOrRecruiter
from .models import Job
from .serializers import JobSerializer


class JobListCreateView(generics.ListCreateAPIView):
    serializer_class = JobSerializer

    def get_queryset(self):
        queryset = Job.objects.all().order_by("-created_at")

        user = self.request.user

        # Recruiters see only their own job postings.
        if (
            user.is_authenticated
            and user.role == "RECRUITER"
        ):
            queryset = queryset.filter(created_by=user)

        search = self.request.query_params.get("search")
        location = self.request.query_params.get("location")
        status = self.request.query_params.get("status")

        if search:
            queryset = queryset.filter(
                title__icontains=search
            )

        if location:
            queryset = queryset.filter(
                location__icontains=location
            )

        if status:
            queryset = queryset.filter(
                status=status
            )

        return queryset

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminOrRecruiter()]

        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = JobSerializer

    def get_queryset(self):
        queryset = Job.objects.all()

        user = self.request.user

        # Recruiters can access only their own job details.
        if (
            user.is_authenticated
            and user.role == "RECRUITER"
        ):
            queryset = queryset.filter(created_by=user)

        return queryset

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsAdminOrRecruiter()]

        return [IsAuthenticated()]
