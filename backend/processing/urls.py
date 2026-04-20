from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProcessingFacilityViewSet, ProcessingJobViewSet,
    ProcessingCostViewSet, YieldRecordViewSet,
)

router = DefaultRouter()
router.register("facilities", ProcessingFacilityViewSet, basename="processing-facility")
router.register("jobs", ProcessingJobViewSet, basename="processing-job")
router.register("costs", ProcessingCostViewSet, basename="processing-cost")
router.register("yields", YieldRecordViewSet, basename="yield-record")

urlpatterns = [
    path("", include(router.urls)),
]
