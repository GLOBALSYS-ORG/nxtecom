import uuid
from django.db import models
from django.conf import settings


class DemandForecast(models.Model):
    """Predicted demand for a product in a region over a time period."""
    class Period(models.TextChoices):
        WEEKLY = "weekly", "Weekly"
        MONTHLY = "monthly", "Monthly"
        QUARTERLY = "quarterly", "Quarterly"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE, related_name="demand_forecasts")
    region = models.CharField(max_length=100)
    period = models.CharField(max_length=20, choices=Period.choices, default=Period.MONTHLY)
    period_start = models.DateField()
    period_end = models.DateField()
    predicted_demand_qty = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    predicted_demand_kg = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    confidence = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Confidence score 0-100")
    actual_demand_qty = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Filled in after period ends")
    data_sources = models.JSONField(default=list, blank=True, help_text="Sources used for prediction")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-period_start"]

    def __str__(self):
        return f"Forecast: {self.product.name} in {self.region} ({self.period_start})"

    @property
    def accuracy(self):
        if self.actual_demand_qty and self.predicted_demand_qty:
            return round(100 - abs(self.actual_demand_qty - self.predicted_demand_qty) / self.predicted_demand_qty * 100, 2)
        return None


class SupplyDemandMatch(models.Model):
    """Matching available supply to forecasted demand."""
    class RecommendedAction(models.TextChoices):
        INCREASE_SUPPLY = "increase_supply", "Increase Supply"
        REDUCE_SUPPLY = "reduce_supply", "Reduce Supply"
        MAINTAIN = "maintain", "Maintain Current Levels"
        REDISTRIBUTE = "redistribute", "Redistribute Stock"
        PRICE_ADJUST = "price_adjust", "Adjust Pricing"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE, related_name="supply_demand_matches")
    region = models.CharField(max_length=100)
    supply_available_kg = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    demand_forecast_kg = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    gap_kg = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Positive = surplus, negative = shortage")
    recommended_action = models.CharField(max_length=20, choices=RecommendedAction.choices, default=RecommendedAction.MAINTAIN)
    price_suggestion = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    computed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-computed_at"]

    def __str__(self):
        return f"S/D Match: {self.product.name} in {self.region}"

    def save(self, *args, **kwargs):
        self.gap_kg = self.supply_available_kg - self.demand_forecast_kg
        super().save(*args, **kwargs)


class PricingRule(models.Model):
    """Configurable pricing rules for dynamic and bulk pricing."""
    class RuleType(models.TextChoices):
        BULK_DISCOUNT = "bulk_discount", "Bulk Discount"
        SEASONAL = "seasonal", "Seasonal Adjustment"
        DYNAMIC = "dynamic", "Dynamic (Supply/Demand)"
        PROMOTIONAL = "promotional", "Promotional"
        TIERED = "tiered", "Tiered Pricing"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE, null=True, blank=True, related_name="pricing_rules")
    category = models.ForeignKey("products.Category", on_delete=models.CASCADE, null=True, blank=True, related_name="pricing_rules")
    rule_type = models.CharField(max_length=20, choices=RuleType.choices)
    conditions = models.JSONField(default=dict, help_text="Rule conditions (e.g. min_qty, date_range)")
    price_modifier = models.DecimalField(max_digits=8, decimal_places=4, default=1.0, help_text="Multiplier: 0.9 = 10% off, 1.1 = 10% markup")
    is_active = models.BooleanField(default=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="pricing_rules")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.get_rule_type_display()})"


class AnalyticsSnapshot(models.Model):
    """Periodic analytics snapshots for dashboards."""
    class SnapshotType(models.TextChoices):
        SALES = "sales", "Sales Analytics"
        INVENTORY = "inventory", "Inventory Analytics"
        SUPPLY_CHAIN = "supply_chain", "Supply Chain Analytics"
        FINANCIAL = "financial", "Financial Analytics"
        PRODUCTION = "production", "Production Analytics"
        DEMAND = "demand", "Demand Analytics"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="analytics_snapshots")
    snapshot_type = models.CharField(max_length=20, choices=SnapshotType.choices)
    period_start = models.DateField()
    period_end = models.DateField()
    data = models.JSONField(default=dict, help_text="Snapshot data as JSON")
    insights = models.JSONField(default=list, blank=True, help_text="Generated insights")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_snapshot_type_display()} for {self.user.username} ({self.period_start})"
