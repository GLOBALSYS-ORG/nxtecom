import uuid
from django.db import models
from django.conf import settings


class ProcessingFacility(models.Model):
    """Facilities where raw agricultural goods are processed into finished products."""
    class FacilityType(models.TextChoices):
        MILL = "mill", "Mill"
        FACTORY = "factory", "Factory"
        PACKHOUSE = "packhouse", "Packhouse"
        ABATTOIR = "abattoir", "Abattoir"
        DAIRY = "dairy", "Dairy Plant"
        COLD_STORAGE = "cold_storage", "Cold Storage"
        OTHER = "other", "Other"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="processing_facilities")
    facility_type = models.CharField(max_length=20, choices=FacilityType.choices, default=FacilityType.FACTORY)
    location = models.CharField(max_length=255, blank=True)
    capacity_kg_per_day = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "processing facilities"

    def __str__(self):
        return f"{self.name} ({self.get_facility_type_display()})"


class ProcessingJob(models.Model):
    """A processing job that transforms raw inputs into finished products."""
    class Status(models.TextChoices):
        QUEUED = "queued", "Queued"
        IN_PROGRESS = "in_progress", "In Progress"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"
        CANCELLED = "cancelled", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job_number = models.CharField(max_length=30, unique=True)
    facility = models.ForeignKey(ProcessingFacility, on_delete=models.CASCADE, related_name="jobs")
    input_batch = models.ForeignKey("aggregation.Batch", on_delete=models.SET_NULL, null=True, blank=True, related_name="processing_jobs")
    output_product = models.ForeignKey("products.Product", on_delete=models.SET_NULL, null=True, blank=True, related_name="processing_jobs")
    input_crop = models.ForeignKey("production.Crop", on_delete=models.SET_NULL, null=True, blank=True)
    input_quantity_kg = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    output_quantity_kg = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    waste_kg = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.QUEUED)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Job {self.job_number}"

    def save(self, *args, **kwargs):
        if not self.job_number:
            self.job_number = f"PJ-{uuid.uuid4().hex[:12].upper()}"
        super().save(*args, **kwargs)

    @property
    def yield_percentage(self):
        if self.input_quantity_kg and self.input_quantity_kg > 0:
            return round((self.output_quantity_kg / self.input_quantity_kg) * 100, 2)
        return 0


class ProcessingCost(models.Model):
    """Cost tracking for processing jobs."""
    class CostType(models.TextChoices):
        LABOR = "labor", "Labor"
        ENERGY = "energy", "Energy"
        PACKAGING = "packaging", "Packaging"
        CHEMICALS = "chemicals", "Chemicals/Additives"
        EQUIPMENT = "equipment", "Equipment"
        OVERHEAD = "overhead", "Overhead"
        OTHER = "other", "Other"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(ProcessingJob, on_delete=models.CASCADE, related_name="costs")
    cost_type = models.CharField(max_length=20, choices=CostType.choices)
    description = models.CharField(max_length=500)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_cost_type_display()}: {self.amount} for {self.job.job_number}"


class YieldRecord(models.Model):
    """Track yield efficiency of processing jobs."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.OneToOneField(ProcessingJob, on_delete=models.CASCADE, related_name="yield_record")
    input_kg = models.DecimalField(max_digits=12, decimal_places=2)
    output_kg = models.DecimalField(max_digits=12, decimal_places=2)
    waste_kg = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    yield_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    recorded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Yield: {self.yield_percentage}% for {self.job.job_number}"

    def save(self, *args, **kwargs):
        if self.input_kg and self.input_kg > 0:
            self.yield_percentage = round((self.output_kg / self.input_kg) * 100, 2)
            self.waste_kg = self.input_kg - self.output_kg
        super().save(*args, **kwargs)
