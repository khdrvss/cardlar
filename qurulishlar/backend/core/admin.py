from django.contrib import admin

from .models import Application, Profile, Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'stage', 'category', 'owner')
    search_fields = ('title', 'category', 'owner__username')


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'university', 'role_preference')
    search_fields = ('user__username', 'university')


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('project', 'applicant', 'status', 'created_at')
    search_fields = ('project__title', 'applicant__username')
    list_filter = ('status',)
