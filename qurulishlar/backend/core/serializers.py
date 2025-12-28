from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Application, Profile, Project


class ProjectSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'stage', 'category', 'skills_needed', 'owner']


class ProfileSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Profile
        fields = ['id', 'user', 'skills', 'university', 'role_preference']


class ApplicationSerializer(serializers.ModelSerializer):
    applicant = serializers.ReadOnlyField(source='applicant.username')
    project_title = serializers.ReadOnlyField(source='project.title')

    class Meta:
        model = Application
        fields = ['id', 'project', 'project_title', 'applicant', 'message', 'status', 'created_at']
        read_only_fields = ['status', 'created_at']


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )
        Profile.objects.create(user=user)
        return user
