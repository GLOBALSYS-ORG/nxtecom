from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum
from .models import Transaction, CreditAccount, CreditPayment, PaymentGateway
from .serializers import (
    TransactionSerializer, CreditAccountSerializer, CreditPaymentSerializer,
    PaymentGatewaySerializer, PaymentGatewayListSerializer,
)
from accounts.permissions import IsSellerRole


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)


class FinanceReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        transactions = Transaction.objects.filter(user=user)
        revenue = transactions.filter(type="credit").aggregate(total=Sum("amount"))["total"] or 0
        expenses = transactions.filter(type="debit").aggregate(total=Sum("amount"))["total"] or 0
        return Response({
            "revenue": revenue,
            "expenses": expenses,
            "profit": revenue - expenses,
            "total_transactions": transactions.count(),
        })


class CreditAccountViewSet(viewsets.ModelViewSet):
    serializer_class = CreditAccountSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return CreditAccount.objects.filter(creditor=user) | CreditAccount.objects.filter(debtor=user)

    @action(detail=True, methods=["post"])
    def pay(self, request, pk=None):
        credit = self.get_object()
        amount = request.data.get("amount")
        if not amount:
            return Response({"error": "Amount is required."}, status=status.HTTP_400_BAD_REQUEST)

        amount = float(amount)
        if amount > float(credit.balance):
            return Response({"error": "Amount exceeds balance."}, status=status.HTTP_400_BAD_REQUEST)

        CreditPayment.objects.create(credit_account=credit, amount=amount)
        credit.amount_paid += amount
        if credit.amount_paid >= credit.amount:
            credit.status = "paid"
        credit.save()
        return Response(CreditAccountSerializer(credit).data)


class PaymentGatewayViewSet(viewsets.ModelViewSet):
    """
    CRUD for payment gateways.
    Only sellers (retailer, wholesaler, company, depot, admin) can manage gateways.
    Each user only sees their own gateways.
    """
    permission_classes = [permissions.IsAuthenticated, IsSellerRole]

    def get_serializer_class(self):
        if self.action in ("list", "retrieve"):
            return PaymentGatewayListSerializer
        return PaymentGatewaySerializer

    def get_queryset(self):
        return PaymentGateway.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=["post"])
    def toggle(self, request, pk=None):
        """Activate or deactivate a payment gateway."""
        gateway = self.get_object()
        gateway.is_active = not gateway.is_active
        gateway.save(update_fields=["is_active", "updated_at"])
        return Response(PaymentGatewayListSerializer(gateway).data)

    @action(detail=False, methods=["get"])
    def providers(self, request):
        """Return the list of supported payment providers."""
        return Response([
            {"value": choice[0], "label": choice[1]}
            for choice in PaymentGateway.Provider.choices
        ])
