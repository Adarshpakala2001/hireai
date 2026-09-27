from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from apps.users.permissions import IsAdminOrRecruiter
from .models import Job
from .serializers import JobSerializer


class JobListCreateView(generics.ListCreateAPIView):
    serializer_class = JobSerializer

    def get_queryset(self):
        queryset = Job.objects.all().order_by("-created_at")

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
    queryset = Job.objects.all()
    serializer_class = JobSerializer

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsAdminOrRecruiter()]

        return [IsAuthenticated()]