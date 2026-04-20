import uuid
from django.db import models
from django.conf import settings


class AffiliateAccount(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="affiliate_account")
    referral_code = models.CharField(max_length=20, unique=True)
    total_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    pending_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Affiliate: {self.user.username} ({self.referral_code})"

    def save(self, *args, **kwargs):
        if not self.referral_code:
            self.referral_code = f"REF-{str(self.id)[:8].upper()}"
        super().save(*args, **kwargs)


class Referral(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACTIVE = "active", "Active"
        PAID = "paid", "Paid"
        EXPIRED = "expired", "Expired"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    affiliate = models.ForeignKey(AffiliateAccount, on_delete=models.CASCADE, related_name="referrals")
    referred_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="referred_by")
    subscription_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    commission_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Referral: {self.referred_user.username} by {self.affiliate.user.username}"


class AffiliateWithdrawal(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        PROCESSED = "processed", "Processed"
        REJECTED = "rejected", "Rejected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    affiliate = models.ForeignKey(AffiliateAccount, on_delete=models.CASCADE, related_name="withdrawals")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Withdrawal: {self.amount} by {self.affiliate.user.username}"


class AffiliateProduct(models.Model):
    """Products that affiliates can promote and sell."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    affiliate = models.ForeignKey(AffiliateAccount, on_delete=models.CASCADE, related_name="promoted_products")
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE, related_name="affiliate_listings")
    custom_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, help_text="Override price for this affiliate")
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=20.0, help_text="Commission percentage")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["affiliate", "product"]

    def __str__(self):
        return f"{self.affiliate.user.username} promotes {self.product.name}"


class AffiliatePerformance(models.Model):
    """Track affiliate performance metrics over time."""
    class Period(models.TextChoices):
        DAILY = "daily", "Daily"
        WEEKLY = "weekly", "Weekly"
        MONTHLY = "monthly", "Monthly"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    affiliate = models.ForeignKey(AffiliateAccount, on_delete=models.CASCADE, related_name="performance_records")
    period = models.CharField(max_length=20, choices=Period.choices, default=Period.MONTHLY)
    period_start = models.DateField()
    period_end = models.DateField()
    orders_generated = models.PositiveIntegerField(default=0)
    revenue_generated = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    commission_earned = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    conversion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Percentage")
    clicks = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-period_start"]

    def __str__(self):
        return f"Performance: {self.affiliate.user.username} ({self.period_start} to {self.period_end})"
