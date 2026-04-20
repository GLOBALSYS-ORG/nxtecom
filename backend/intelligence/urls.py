from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DemandForecastViewSet, SupplyDemandMatchViewSet,
    PricingRuleViewSet, AnalyticsSnapshotViewSet,
)

router = DefaultRouter()
router.register("demand-forecasts", DemandForecastViewSet, basename="demand-forecast")
router.register("supply-demand", SupplyDemandMatchViewSet, basename="supply-demand")
router.register("pricing-rules", PricingRuleViewSet, basename="pricing-rule")
router.register("analytics", AnalyticsSnapshotViewSet, basename="analytics-snapshot")

urlpatterns = [
    path("", include(router.urls)),
]
