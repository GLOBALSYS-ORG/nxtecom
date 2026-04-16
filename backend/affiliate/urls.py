from django.urls import path
from . import views

urlpatterns = [
    path("dashboard/", views.AffiliateDashboardView.as_view(), name="affiliate-dashboard"),
    path("referrals/", views.AffiliateReferralsView.as_view(), name="affiliate-referrals"),
    path("withdraw/", views.AffiliateWithdrawView.as_view(), name="affiliate-withdraw"),
]
