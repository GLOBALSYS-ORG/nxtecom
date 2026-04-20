import uuid
from django.db import models
from django.conf import settings


class Crop(models.Model):
    """Catalog of crop types."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    category = models.CharField(max_length=100, blank=True, help_text="e.g. cereal, legume, fruit, vegetable")
    description = models.TextField(blank=True)
    growing_season = models.CharField(max_length=100, blank=True)
    avg_yield_per_acre = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="kg per acre")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class PlantingRecord(models.Model):
    """Track planting activities."""
    class Status(models.TextChoices):
        PLANTED = "planted", "Planted"
        GROWING = "growing", "Growing"
        READY_TO_HARVEST = "ready_to_harvest", "Ready to Harvest"
        HARVESTED = "harvested", "Harvested"
        FAILED = "failed", "Failed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="planting_records")
    crop = models.ForeignKey(Crop, on_delete=models.CASCADE, related_name="planting_records")
    field_name = models.CharField(max_length=255, blank=True, help_text="Name/identifier of the field")
    area_acres = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    planting_date = models.DateField()
    expected_harvest_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PLANTED)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-planting_date"]

    def __str__(self):
        return f"{self.crop.name} - {self.field_name} ({self.planting_date})"


class HarvestRecord(models.Model):
    """Track harvest yields."""
    class QualityGrade(models.TextChoices):
        PREMIUM = "premium", "Premium"
        GRADE_A = "grade_a", "Grade A"
        GRADE_B = "grade_b", "Grade B"
        GRADE_C = "grade_c", "Grade C"
        REJECTED = "rejected", "Rejected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    planting_record = models.ForeignKey(PlantingRecord, on_delete=models.CASCADE, related_name="harvests")
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="harvest_records")
    harvest_date = models.DateField()
    yield_kg = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    quality_grade = models.CharField(max_length=20, choices=QualityGrade.choices, default=QualityGrade.GRADE_A)
    storage_location = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-harvest_date"]

    def __str__(self):
        return f"Harvest: {self.yield_kg}kg - {self.planting_record.crop.name}"


class LivestockRecord(models.Model):
    """Track livestock."""
    class AnimalType(models.TextChoices):
        CATTLE = "cattle", "Cattle"
        GOATS = "goats", "Goats"
        SHEEP = "sheep", "Sheep"
        PIGS = "pigs", "Pigs"
        POULTRY = "poultry", "Poultry"
        FISH = "fish", "Fish"
        RABBITS = "rabbits", "Rabbits"
        OTHER = "other", "Other"

    class HealthStatus(models.TextChoices):
        HEALTHY = "healthy", "Healthy"
        SICK = "sick", "Sick"
        QUARANTINE = "quarantine", "Quarantine"
        DECEASED = "deceased", "Deceased"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="livestock_records")
    animal_type = models.CharField(max_length=20, choices=AnimalType.choices)
    breed = models.CharField(max_length=100, blank=True)
    count = models.PositiveIntegerField(default=0)
    health_status = models.CharField(max_length=20, choices=HealthStatus.choices, default=HealthStatus.HEALTHY)
    location = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["animal_type"]

    def __str__(self):
        return f"{self.get_animal_type_display()} ({self.count}) - {self.farmer.username}"


class PurchaseOffer(models.Model):
    """Companies making purchase offers to farmers."""
    class Status(models.TextChoices):
        OPEN = "open", "Open"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"
        EXPIRED = "expired", "Expired"
        FULFILLED = "fulfilled", "Fulfilled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="purchase_offers_made")
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="purchase_offers_received")
    crop = models.ForeignKey(Crop, on_delete=models.SET_NULL, null=True, blank=True)
    product_description = models.CharField(max_length=500)
    quantity_kg = models.DecimalField(max_digits=12, decimal_places=2)
    price_per_kg = models.DecimalField(max_digits=12, decimal_places=2)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    delivery_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Offer: {self.product_description} ({self.quantity_kg}kg)"

    def save(self, *args, **kwargs):
        self.total_amount = self.quantity_kg * self.price_per_kg
        super().save(*args, **kwargs)


class SupplyContract(models.Model):
    """Contract-based supply commitments between farmers and buyers."""
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        ACTIVE = "active", "Active"
        FULFILLED = "fulfilled", "Fulfilled"
        CANCELLED = "cancelled", "Cancelled"
        EXPIRED = "expired", "Expired"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contract_number = models.CharField(max_length=30, unique=True)
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="supply_contracts_as_farmer")
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="supply_contracts_as_buyer")
    crop = models.ForeignKey(Crop, on_delete=models.SET_NULL, null=True, related_name="supply_contracts")
    committed_quantity_kg = models.DecimalField(max_digits=12, decimal_places=2)
    delivered_quantity_kg = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    price_per_kg = models.DecimalField(max_digits=12, decimal_places=2)
    total_value = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    delivery_schedule = models.JSONField(default=list, blank=True, help_text="List of delivery milestones")
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    terms = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Contract {self.contract_number}"

    def save(self, *args, **kwargs):
        if not self.contract_number:
            self.contract_number = f"SC-{uuid.uuid4().hex[:12].upper()}"
        self.total_value = self.committed_quantity_kg * self.price_per_kg
        super().save(*args, **kwargs)

    @property
    def fulfillment_pct(self):
        if self.committed_quantity_kg and self.committed_quantity_kg > 0:
            return round((self.delivered_quantity_kg / self.committed_quantity_kg) * 100, 2)
        return 0


class HarvestForecast(models.Model):
    """Forecast of expected harvest yield from a planting record."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    planting_record = models.ForeignKey(PlantingRecord, on_delete=models.CASCADE, related_name="forecasts")
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="harvest_forecasts")
    estimated_yield_kg = models.DecimalField(max_digits=12, decimal_places=2)
    confidence = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Confidence 0-100")
    forecast_date = models.DateField()
    methodology = models.CharField(max_length=100, blank=True, help_text="How the forecast was generated")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-forecast_date"]

    def __str__(self):
        return f"Forecast: {self.estimated_yield_kg}kg for {self.planting_record}"
