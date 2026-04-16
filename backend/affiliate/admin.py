from django.contrib import admin
from .models import AffiliateAccount, Referral, AffiliateWithdrawal


@admin.register(AffiliateAccount)
class AffiliateAccountAdmin(admin.ModelAdmin):
    list_display = ("user", "referral_code", "total_earnings", "pending_earnings", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("user__username", "referral_code")


@admin.register(Referral)
class ReferralAdmin(admin.ModelAdmin):
    list_display = ("affiliate", "referred_user", "subscription_amount", "commission_amount", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("affiliate__user__username", "referred_user__username")


@admin.register(AffiliateWithdrawal)
class AffiliateWithdrawalAdmin(admin.ModelAdmin):
    list_display = ("affiliate", "amount", "status", "processed_at", "created_at")
    list_filter = ("status",)
    search_fields = ("affiliate__user__username",)
