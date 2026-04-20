import uuid
from django.db import models
from django.conf import settings


class AggregationCenter(models.Model):
    """Collection points where goods from multiple farmers are aggregated."""
    class CenterType(models.TextChoices):
        COLLECTION_POINT = "collection_point", "Collection Point"
        BUYING_CENTER = "buying_center", "Buying Center"
        COOPERATIVE = "cooperative", "Cooperative"
        WAREHOUSE = "warehouse", "Warehouse"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    manager = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="managed_centers")
    center_type = models.CharField(max_length=20, choices=CenterType.choices, default=CenterType.COLLECTION_POINT)
    location = models.CharField(max_length=255)
    address = models.TextField(blank=True)
    region = models.CharField(max_length=100, blank=True)
    capacity_kg = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    current_stock_kg = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.get_center_type_display()})"


class Batch(models.Model):
    """A batch of aggregated goods ready for processing or distribution."""
    class Status(models.TextChoices):
        CREATED = "created", "Created"
        AGGREGATING = "aggregating", "Aggregating"
        COMPLETE = "complete", "Complete"
        PROCESSING = "processing", "Sent to Processing"
        DISPATCHED = "dispatched", "Dispatched"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    batch_number = models.CharField(max_length=30, unique=True)
    center = models.ForeignKey(AggregationCenter, on_delete=models.CASCADE, related_name="batches")
    crop = models.ForeignKey("production.Crop", on_delete=models.SET_NULL, null=True, related_name="batches")
    total_quantity_kg = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    quality_grade = models.CharField(max_length=20, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CREATED)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "batches"

    def __str__(self):
        return f"Batch {self.batch_number}"

    def save(self, *args, **kwargs):
        if not self.batch_number:
            self.batch_number = f"BAT-{uuid.uuid4().hex[:12].upper()}"
        super().save(*args, **kwargs)


class IntakeRecord(models.Model):
    """Record of goods received from a farmer at an aggregation center."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    center = models.ForeignKey(AggregationCenter, on_delete=models.CASCADE, related_name="intakes")
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="intake_records")
    harvest_record = models.ForeignKey("production.HarvestRecord", on_delete=models.SET_NULL, null=True, blank=True, related_name="intakes")
    batch = models.ForeignKey(Batch, on_delete=models.SET_NULL, null=True, blank=True, related_name="intakes")
    crop = models.ForeignKey("production.Crop", on_delete=models.SET_NULL, null=True, related_name="intakes")
    quantity_kg = models.DecimalField(max_digits=12, decimal_places=2)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Price paid per kg to farmer")
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    received_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="intakes_received")
    notes = models.TextField(blank=True)
    received_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-received_at"]

    def __str__(self):
        return f"Intake: {self.quantity_kg}kg from {self.farmer.username}"

    def save(self, *args, **kwargs):
        self.total_amount = self.quantity_kg * self.unit_price
        super().save(*args, **kwargs)


class QualityAssessment(models.Model):
    """Quality assessment for intake records."""
    class Grade(models.TextChoices):
        PREMIUM = "premium", "Premium"
        GRADE_A = "grade_a", "Grade A"
        GRADE_B = "grade_b", "Grade B"
        GRADE_C = "grade_c", "Grade C"
        REJECTED = "rejected", "Rejected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    intake = models.OneToOneField(IntakeRecord, on_delete=models.CASCADE, related_name="quality_assessment")
    grade = models.CharField(max_length=20, choices=Grade.choices, default=Grade.GRADE_A)
    moisture_content = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Percentage")
    impurity_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Percentage of impurities")
    size_uniformity = models.CharField(max_length=50, blank=True)
    color_assessment = models.CharField(max_length=50, blank=True)
    assessed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="quality_assessments")
    notes = models.TextField(blank=True)
    assessed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"QA: {self.get_grade_display()} for intake {self.intake.id}"
