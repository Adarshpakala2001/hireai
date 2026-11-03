
from rest_framework.permissions import BasePermission

from .models import User


class IsAdminOrRecruiter(BasePermission):
    """
    Allows access only to Admin and Recruiter users.
    """

    def has_permission(self, request, view):

        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in [
                User.Role.ADMIN,
                User.Role.RECRUITER,
            ]
        )


class IsCandidate(BasePermission):
    """
    Allows access only to Candidate users.
    """

    def has_permission(self, request, view):

        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.CANDIDATE
        )
