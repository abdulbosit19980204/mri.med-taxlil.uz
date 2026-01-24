from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AnalysisViewSet, RegisterView, DatasetViewSet, MeView
from .metrics_view import MetricsView

router = DefaultRouter()
router.register(r'analyses', AnalysisViewSet, basename='analysis')
router.register(r'datasets', DatasetViewSet, basename='dataset')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', MeView.as_view(), name='me'),
    path('metrics/', MetricsView.as_view(), name='metrics'),
    path('', include(router.urls)),
]
