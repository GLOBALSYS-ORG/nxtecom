from rest_framework import serializers
from .models import Transaction, CreditAccount, CreditPayment, PaymentGateway, CreditLimit, Budget, Expense, Invoice


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class CreditAccountSerializer(serializers.ModelSerializer):
    balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    creditor_name = serializers.CharField(source="creditor.username", read_only=True)
    debtor_name = serializers.CharField(source="debtor.username", read_only=True)

    class Meta:
        model = CreditAccount
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class CreditPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditPayment
        fields = "__all__"
        read_only_fields = ["id", "paid_at"]


class PaymentGatewaySerializer(serializers.ModelSerializer):
    provider_display = serializers.CharField(source="get_provider_display", read_only=True)
    masked_api_key = serializers.CharField(read_only=True)
    masked_api_secret = serializers.CharField(read_only=True)

    class Meta:
        model = PaymentGateway
        fields = [
            "id", "provider", "provider_display", "display_name",
            "api_key", "api_secret", "webhook_secret", "merchant_id",
            "environment", "is_active", "extra_config",
            "masked_api_key", "masked_api_secret",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {
            "api_key": {"write_only": True},
            "api_secret": {"write_only": True},
            "webhook_secret": {"write_only": True},
        }


class PaymentGatewayListSerializer(serializers.ModelSerializer):
    """Read-only serializer that shows masked keys instead of raw values."""
    provider_display = serializers.CharField(source="get_provider_display", read_only=True)
    masked_api_key = serializers.CharField(read_only=True)
    masked_api_secret = serializers.CharField(read_only=True)

    class Meta:
        model = PaymentGateway
        fields = [
            "id", "provider", "provider_display", "display_name",
            "masked_api_key", "masked_api_secret", "merchant_id",
            "environment", "is_active", "extra_config",
            "created_at", "updated_at",
        ]


class CreditLimitSerializer(serializers.ModelSerializer):
    creditor_name = serializers.CharField(source="creditor.username", read_only=True)
    debtor_name = serializers.CharField(source="debtor.username", read_only=True)
    available_credit = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)

    class Meta:
        model = CreditLimit
        fields = "__all__"
        read_only_fields = ["id", "creditor", "created_at", "updated_at"]


class BudgetSerializer(serializers.ModelSerializer):
    remaining = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)

    class Meta:
        model = Budget
        fields = "__all__"
        read_only_fields = ["id", "user", "created_at"]


class ExpenseSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source="get_category_display", read_only=True)

    class Meta:
        model = Expense
        fields = "__all__"
        read_only_fields = ["id", "user", "created_at"]


class InvoiceSerializer(serializers.ModelSerializer):
    issuer_name = serializers.CharField(source="issuer.username", read_only=True)
    recipient_name = serializers.CharField(source="recipient.username", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Invoice
        fields = "__all__"
        read_only_fields = ["id", "invoice_number", "total", "created_at", "updated_at"]
