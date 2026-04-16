from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("transactions", views.TransactionViewSet, basename="transaction")
router.register("credits", views.CreditAccountViewSet, basename="credit")

urlpatterns = [
    path("reports/", views.FinanceReportView.as_view(), name="finance-reports"),
    path("", include(router.urls)),
]
