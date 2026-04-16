from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("transactions", views.TransactionViewSet, basename="transaction")
router.register("credits", views.CreditAccountViewSet, basename="credit")
router.register("payment-gateways", views.PaymentGatewayViewSet, basename="payment-gateway")

urlpatterns = [
    path("reports/", views.FinanceReportView.as_view(), name="finance-reports"),
    path("", include(router.urls)),
]
