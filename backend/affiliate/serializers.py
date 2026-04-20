from rest_framework import serializers
from .models import AffiliateAccount, Referral, AffiliateWithdrawal, AffiliateProduct, AffiliatePerformance


class AffiliateAccountSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = AffiliateAccount
        fields = "__all__"
        read_only_fields = ["id", "total_earnings", "pending_earnings", "created_at"]


class ReferralSerializer(serializers.ModelSerializer):
    referred_username = serializers.CharField(source="referred_user.username", read_only=True)

    class Meta:
        model = Referral
        fields = "__all__"
        read_only_fields = ["id", "commission_amount", "created_at"]


class AffiliateWithdrawalSerializer(serializers.ModelSerializer):
    class Meta:
        model = AffiliateWithdrawal
        fields = "__all__"
        read_only_fields = ["id", "processed_at", "created_at"]


class AffiliateProductSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    affiliate_name = serializers.CharField(source="affiliate.user.username", read_only=True)

    class Meta:
        model = AffiliateProduct
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class AffiliatePerformanceSerializer(serializers.ModelSerializer):
    affiliate_name = serializers.CharField(source="affiliate.user.username", read_only=True)

    class Meta:
        model = AffiliatePerformance
        fields = "__all__"
        read_only_fields = ["id", "created_at"]
