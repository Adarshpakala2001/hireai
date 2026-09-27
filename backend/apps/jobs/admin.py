from django.contrib import admin

from .models import Job


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "department",
        "location",
        "employment_type",
        "status",
        "created_by",
        "created_at",
    )

    list_filter = (
        "status",
        "employment_type",
        "department",
    )

    search_fields = (
        "title",
        "department",
        "location",
        "skills",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )