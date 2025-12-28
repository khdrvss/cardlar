from django.conf import settings
from django.db import models


class Project(models.Model):
    STAGE_CHOICES = [
        ('idea', 'Idea'),
        ('prototype', 'Prototype'),
        ('building', 'Building'),
        ('launched', 'Launched'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    stage = models.CharField(max_length=50, choices=STAGE_CHOICES)
    category = models.CharField(max_length=120)
    skills_needed = models.TextField()
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_projects',
    )

    def __str__(self):
        return self.title


class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile',
    )
    skills = models.TextField(blank=True)
    university = models.CharField(max_length=200, blank=True)
    role_preference = models.CharField(max_length=120, blank=True)

    def __str__(self):
        return self.user.username


class Application(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='applications',
    )
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('project', 'applicant')

    def __str__(self):
        return f"{self.applicant} -> {self.project}"
