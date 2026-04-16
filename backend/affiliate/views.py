from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import AffiliateAccount, Referral, AffiliateWithdrawal
from .serializers import AffiliateAccountSerializer, ReferralSerializer, AffiliateWithdrawalSerializer
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
        if not amount or float(amount) <= 0:
            return Response({"error": "Invalid amount."}, status=status.HTTP_400_BAD_REQUEST)

        amount = float(amount)
        if amount > float(account.pending_earnings):
            return Response({"error": "Insufficient balance."}, status=status.HTTP_400_BAD_REQUEST)

        withdrawal = AffiliateWithdrawal.objects.create(affiliate=account, amount=amount)
        account.pending_earnings -= amount
        account.save()
        return Response(AffiliateWithdrawalSerializer(withdrawal).data, status=status.HTTP_201_CREATED)
