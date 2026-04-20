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


class CreditLimit(models.Model):
    """Credit limits between parties (company->wholesaler, wholesaler->retailer, etc.)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    creditor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="credit_limits_given")
    debtor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="credit_limits_received")
    credit_limit = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    used_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    risk_score = models.IntegerField(default=50, help_text="0-100, higher = riskier")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["creditor", "debtor"]

    @property
    def available_credit(self):
        return self.credit_limit - self.used_amount

    def __str__(self):
        return f"CreditLimit: {self.creditor.username} -> {self.debtor.username} ({self.credit_limit})"


class Budget(models.Model):
    """Budget tracking per user."""
    class Period(models.TextChoices):
        DAILY = "daily", "Daily"
        WEEKLY = "weekly", "Weekly"
        MONTHLY = "monthly", "Monthly"
        QUARTERLY = "quarterly", "Quarterly"
        YEARLY = "yearly", "Yearly"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="budgets")
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100, blank=True)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    spent = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    period = models.CharField(max_length=20, choices=Period.choices, default=Period.MONTHLY)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def remaining(self):
        return self.amount - self.spent

    def __str__(self):
        return f"Budget: {self.name} ({self.amount})"


class Expense(models.Model):
    """Categorized expense tracking."""
    class Category(models.TextChoices):
        INVENTORY = "inventory", "Inventory Purchase"
        TRANSPORT = "transport", "Transportation"
        RENT = "rent", "Rent"
        SALARY = "salary", "Salary/Wages"
        UTILITIES = "utilities", "Utilities"
        MARKETING = "marketing", "Marketing"
        MAINTENANCE = "maintenance", "Maintenance"
        TAX = "tax", "Tax"
        OTHER = "other", "Other"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="expenses")
    category = models.CharField(max_length=20, choices=Category.choices)
    description = models.TextField()
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    date = models.DateField()
    receipt_reference = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"Expense: {self.category} - {self.amount}"


class Invoice(models.Model):
    """Invoices between parties."""
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SENT = "sent", "Sent"
        PAID = "paid", "Paid"
        OVERDUE = "overdue", "Overdue"
        CANCELLED = "cancelled", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice_number = models.CharField(max_length=30, unique=True)
    issuer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="invoices_issued")
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="invoices_received")
    order = models.ForeignKey("orders.Order", on_delete=models.SET_NULL, null=True, blank=True, related_name="invoices")
    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    due_date = models.DateField()
    paid_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Invoice {self.invoice_number}"

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            import time
            self.invoice_number = f"INV-{int(time.time())}"
        self.total = self.subtotal + self.tax_amount
        super().save(*args, **kwargs)


class FarmerPayment(models.Model):
    """Payments made to farmers for goods received."""
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        PROCESSED = "processed", "Processed"
        FAILED = "failed", "Failed"

    class PaymentMethod(models.TextChoices):
        MOBILE_MONEY = "mobile_money", "Mobile Money"
        BANK_TRANSFER = "bank_transfer", "Bank Transfer"
        CASH = "cash", "Cash"
        CHECK = "check", "Check"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="farmer_payments")
    payer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payments_to_farmers")
    intake_record = models.ForeignKey("aggregation.IntakeRecord", on_delete=models.SET_NULL, null=True, blank=True, related_name="payments")
    contract = models.ForeignKey("production.SupplyContract", on_delete=models.SET_NULL, null=True, blank=True, related_name="payments")
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.MOBILE_MONEY)
    reference = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    paid_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Payment: {self.amount} to {self.farmer.username}"


class BatchCostTracking(models.Model):
    """Track costs associated with a batch through the value chain."""
    class CostType(models.TextChoices):
        PROCUREMENT = "procurement", "Procurement (farmer payment)"
        AGGREGATION = "aggregation", "Aggregation"
        PROCESSING = "processing", "Processing"
        TRANSPORT = "transport", "Transportation"
        STORAGE = "storage", "Storage"
        PACKAGING = "packaging", "Packaging"
        OTHER = "other", "Other"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    batch = models.ForeignKey("aggregation.Batch", on_delete=models.CASCADE, related_name="cost_tracking")
    cost_type = models.CharField(max_length=20, choices=CostType.choices)
    description = models.CharField(max_length=500)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    incurred_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="batch_costs")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_cost_type_display()}: {self.amount} for {self.batch}"


class ProfitMarginReport(models.Model):
    """Profit margin analysis per product and period."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profit_margin_reports")
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE, related_name="profit_margins")
    period_start = models.DateField()
    period_end = models.DateField()
    revenue = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    cost_of_goods = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    gross_profit = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    operating_expenses = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    net_profit = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    margin_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    units_sold = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-period_start"]

    def __str__(self):
        return f"Margin: {self.product.name} ({self.margin_pct}%)"

    def save(self, *args, **kwargs):
        self.gross_profit = self.revenue - self.cost_of_goods
        self.net_profit = self.gross_profit - self.operating_expenses
        if self.revenue and self.revenue > 0:
            self.margin_pct = round((self.net_profit / self.revenue) * 100, 2)
        super().save(*args, **kwargs)
