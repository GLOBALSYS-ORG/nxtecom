from rest_framework import serializers
from .models import Transaction, CreditAccount, CreditPayment


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
