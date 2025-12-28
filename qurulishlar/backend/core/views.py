from rest_framework import generics, permissions, viewsets

from .models import Application, Profile, Project
from .serializers import ApplicationSerializer, ProfileSerializer, ProjectSerializer, SignupSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    queryset = Project.objects.all().order_by('-id')
    http_method_names = ['get', 'post']

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ProfileViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProfileSerializer
    queryset = Profile.objects.select_related('user').all()


class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer
    queryset = Application.objects.select_related('project', 'applicant').all()
    http_method_names = ['get', 'post']
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = self.queryset
        user = self.request.query_params.get('user')
        project = self.request.query_params.get('project')

        if user:
            if user.isdigit():
                queryset = queryset.filter(applicant_id=user)
            else:
                queryset = queryset.filter(applicant__username=user)
        if project:
            queryset = queryset.filter(project_id=project)
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)


class SignupView(generics.CreateAPIView):
    serializer_class = SignupSerializer
    permission_classes = [permissions.AllowAny]
