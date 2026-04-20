from django.contrib import admin
from .models import (
    Transaction, CreditAccount, CreditPayment, PaymentGateway, CreditLimit,
    Budget, Expense, Invoice, FarmerPayment, BatchCostTracking, ProfitMarginReport,
)


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("user", "type", "amount", "reference", "created_at")
    list_filter = ("type",)
    search_fields = ("user__username", "description", "reference")
    ordering = ("-created_at",)


class CreditPaymentInline(admin.TabularInline):
    model = CreditPayment
    extra = 0
    readonly_fields = ("paid_at",)


@admin.register(CreditAccount)
class CreditAccountAdmin(admin.ModelAdmin):
    list_display = ("creditor", "debtor", "amount", "amount_paid", "balance", "status", "risk_score", "due_date")
    list_filter = ("status",)
    search_fields = ("creditor__username", "debtor__username")
    inlines = [CreditPaymentInline]


@admin.register(CreditPayment)
class CreditPaymentAdmin(admin.ModelAdmin):
    list_display = ("credit_account", "amount", "paid_at")
    search_fields = ("credit_account__creditor__username", "credit_account__debtor__username")


@admin.register(PaymentGateway)
class PaymentGatewayAdmin(admin.ModelAdmin):
    list_display = ("display_name", "owner", "provider", "environment", "is_active", "created_at")
    list_filter = ("provider", "environment", "is_active")
    search_fields = ("display_name", "owner__username", "merchant_id")
    readonly_fields = ("masked_api_key", "masked_api_secret")


@admin.register(CreditLimit)
class CreditLimitAdmin(admin.ModelAdmin):
    list_display = ("creditor", "debtor", "credit_limit", "used_amount", "risk_score", "is_active")
    list_filter = ("is_active",)
    search_fields = ("creditor__username", "debtor__username")


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "amount", "spent", "period", "start_date", "end_date", "is_active")
    list_filter = ("period", "is_active")
    search_fields = ("name", "user__username")


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("user", "category", "amount", "date", "receipt_reference")
    list_filter = ("category",)
    search_fields = ("user__username", "description")


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("invoice_number", "issuer", "recipient", "subtotal", "tax_amount", "total", "status", "due_date")
    list_filter = ("status",)
    search_fields = ("invoice_number", "issuer__username", "recipient__username")


@admin.register(FarmerPayment)
class FarmerPaymentAdmin(admin.ModelAdmin):
    list_display = ("farmer", "payer", "amount", "payment_method", "status", "paid_at", "created_at")
    list_filter = ("status", "payment_method")
    search_fields = ("farmer__username", "payer__username", "reference")


@admin.register(BatchCostTracking)
class BatchCostTrackingAdmin(admin.ModelAdmin):
    list_display = ("batch", "cost_type", "description", "amount", "incurred_by", "created_at")
    list_filter = ("cost_type",)
    search_fields = ("description", "batch__batch_number")


@admin.register(ProfitMarginReport)
class ProfitMarginReportAdmin(admin.ModelAdmin):
    list_display = ("user", "product", "period_start", "period_end", "revenue", "net_profit", "margin_pct")
    list_filter = ("period_start",)
    search_fields = ("user__username", "product__name")
