from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from core.views import ApplicationViewSet, ProfileViewSet, ProjectViewSet, SignupView

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'applications', ApplicationViewSet, basename='application')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/signup/', SignupView.as_view(), name='signup'),
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include(router.urls)),
]
