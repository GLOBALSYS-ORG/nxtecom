from django.contrib import admin
from .models import Transaction, CreditAccount, CreditPayment, PaymentGateway


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
