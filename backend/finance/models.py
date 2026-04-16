import uuid
from django.db import models
from django.conf import settings


class Transaction(models.Model):
    class Type(models.TextChoices):
        CREDIT = "credit", "Credit"
        DEBIT = "debit", "Debit"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="transactions")
    type = models.CharField(max_length=10, choices=Type.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField(blank=True)
    reference = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.type}: {self.amount} - {self.user.username}"


class CreditAccount(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        PAID = "paid", "Paid"
        OVERDUE = "overdue", "Overdue"
        DEFAULTED = "defaulted", "Defaulted"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    creditor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="credits_given")
    debtor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="credits_received")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    due_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    risk_score = models.IntegerField(default=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Credit: {self.creditor.username} -> {self.debtor.username} ({self.amount})"

    @property
    def balance(self):
        return self.amount - self.amount_paid


class CreditPayment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    credit_account = models.ForeignKey(CreditAccount, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment of {self.amount} on {self.credit_account}"


class PaymentGateway(models.Model):
    class Provider(models.TextChoices):
        MTN_MOMO = "mtn_momo", "MTN Mobile Money"
        AIRTEL_MONEY = "airtel_money", "Airtel Money"
        FLUTTERWAVE = "flutterwave", "Flutterwave"
        PAYSTACK = "paystack", "Paystack"
        STRIPE = "stripe", "Stripe"
        PESAPAL = "pesapal", "Pesapal"
        DPOGROUP = "dpogroup", "DPO Group"
        BEYONIC = "beyonic", "Beyonic"
        CUSTOM = "custom", "Custom"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="payment_gateways",
    )
    provider = models.CharField(max_length=30, choices=Provider.choices)
    display_name = models.CharField(
        max_length=100,
        help_text="Name shown to customers at checkout, e.g. 'Pay with MTN MoMo'",
    )
    api_key = models.CharField(max_length=500, blank=True)
    api_secret = models.CharField(max_length=500, blank=True)
    webhook_secret = models.CharField(max_length=500, blank=True)
    merchant_id = models.CharField(max_length=255, blank=True)
    environment = models.CharField(
        max_length=20,
        choices=[("sandbox", "Sandbox"), ("production", "Production")],
        default="sandbox",
    )
    is_active = models.BooleanField(default=True)
    extra_config = models.JSONField(
        default=dict,
        blank=True,
        help_text="Additional provider-specific config (JSON)",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ["owner", "provider"]

    def __str__(self):
        return f"{self.display_name} ({self.get_provider_display()}) - {self.owner.username}"

    @property
    def masked_api_key(self):
        if not self.api_key:
            return ""
        return self.api_key[:4] + "****" + self.api_key[-4:] if len(self.api_key) > 8 else "****"

    @property
    def masked_api_secret(self):
        if not self.api_secret:
            return ""
        return "****" + self.api_secret[-4:] if len(self.api_secret) > 4 else "****"
