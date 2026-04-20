from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import AffiliateAccount, Referral, AffiliateWithdrawal, AffiliateProduct, AffiliatePerformance
from .serializers import (
    AffiliateAccountSerializer, ReferralSerializer, AffiliateWithdrawalSerializer,
    AffiliateProductSerializer, AffiliatePerformanceSerializer,
)
from accounts.permissions import IsAffiliate


class AffiliateDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            account = AffiliateAccount.objects.get(user=request.user)
        except AffiliateAccount.DoesNotExist:
            return Response({"error": "Not an affiliate."}, status=status.HTTP_404_NOT_FOUND)

        referrals = Referral.objects.filter(affiliate=account)
        return Response({
            "account": AffiliateAccountSerializer(account).data,
            "total_referrals": referrals.count(),
            "active_referrals": referrals.filter(status="active").count(),
            "total_earnings": float(account.total_earnings),
            "pending_earnings": float(account.pending_earnings),
        })


class AffiliateReferralsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            account = AffiliateAccount.objects.get(user=request.user)
        except AffiliateAccount.DoesNotExist:
            return Response({"error": "Not an affiliate."}, status=status.HTTP_404_NOT_FOUND)

        referrals = Referral.objects.filter(affiliate=account)
        return Response(ReferralSerializer(referrals, many=True).data)


class AffiliateWithdrawView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            account = AffiliateAccount.objects.get(user=request.user)
        except AffiliateAccount.DoesNotExist:
            return Response({"error": "Not an affiliate."}, status=status.HTTP_404_NOT_FOUND)

        amount = request.data.get("amount")
        if not amount:
            return Response({"error": "Invalid amount."}, status=status.HTTP_400_BAD_REQUEST)

        from decimal import Decimal, InvalidOperation
        try:
            amount = Decimal(str(amount))
        except (InvalidOperation, ValueError):
            return Response({"error": "Invalid amount."}, status=status.HTTP_400_BAD_REQUEST)

        if amount <= 0:
            return Response({"error": "Invalid amount."}, status=status.HTTP_400_BAD_REQUEST)

        if amount > account.pending_earnings:
            return Response({"error": "Insufficient balance."}, status=status.HTTP_400_BAD_REQUEST)

        withdrawal = AffiliateWithdrawal.objects.create(affiliate=account, amount=amount)
        account.pending_earnings -= amount
        account.save()
        return Response(AffiliateWithdrawalSerializer(withdrawal).data, status=status.HTTP_201_CREATED)


class AffiliateProductViewSet(viewsets.ModelViewSet):
    serializer_class = AffiliateProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return AffiliateProduct.objects.all()
        try:
            account = AffiliateAccount.objects.get(user=user)
            return AffiliateProduct.objects.filter(affiliate=account)
        except AffiliateAccount.DoesNotExist:
            return AffiliateProduct.objects.none()

    def perform_create(self, serializer):
        account = AffiliateAccount.objects.get(user=self.request.user)
        serializer.save(affiliate=account)


class AffiliatePerformanceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AffiliatePerformanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return AffiliatePerformance.objects.all()
        try:
            account = AffiliateAccount.objects.get(user=user)
            return AffiliatePerformance.objects.filter(affiliate=account)
        except AffiliateAccount.DoesNotExist:
            return AffiliatePerformance.objects.none()
