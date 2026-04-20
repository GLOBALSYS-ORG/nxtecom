from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AggregationCenterViewSet, BatchViewSet,
    IntakeRecordViewSet, QualityAssessmentViewSet,
)

router = DefaultRouter()
router.register("centers", AggregationCenterViewSet, basename="aggregation-center")
router.register("batches", BatchViewSet, basename="batch")
router.register("intakes", IntakeRecordViewSet, basename="intake")
router.register("quality-assessments", QualityAssessmentViewSet, basename="quality-assessment")

urlpatterns = [
    path("", include(router.urls)),
]
