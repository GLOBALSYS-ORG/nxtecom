from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("products", views.AffiliateProductViewSet, basename="affiliate-product")
router.register("performance", views.AffiliatePerformanceViewSet, basename="affiliate-performance")

urlpatterns = [
    path("dashboard/", views.AffiliateDashboardView.as_view(), name="affiliate-dashboard"),
    path("referrals/", views.AffiliateReferralsView.as_view(), name="affiliate-referrals"),
    path("withdraw/", views.AffiliateWithdrawView.as_view(), name="affiliate-withdraw"),
    path("", include(router.urls)),
]
