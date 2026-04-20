from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("transactions", views.TransactionViewSet, basename="transaction")
router.register("credits", views.CreditAccountViewSet, basename="credit")
router.register("credit-limits", views.CreditLimitViewSet, basename="credit-limit")
router.register("budgets", views.BudgetViewSet, basename="budget")
router.register("expenses", views.ExpenseViewSet, basename="expense")
router.register("invoices", views.InvoiceViewSet, basename="invoice")
router.register("payment-gateways", views.PaymentGatewayViewSet, basename="payment-gateway")
router.register("farmer-payments", views.FarmerPaymentViewSet, basename="farmer-payment")
router.register("batch-costs", views.BatchCostTrackingViewSet, basename="batch-cost")
router.register("profit-margins", views.ProfitMarginReportViewSet, basename="profit-margin")

urlpatterns = [
    path("reports/", views.FinanceReportView.as_view(), name="finance-reports"),
    path("", include(router.urls)),
]
