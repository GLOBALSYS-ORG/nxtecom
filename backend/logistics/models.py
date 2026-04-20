import uuid
from django.db import models
from django.conf import settings


class Transporter(models.Model):
    """Registered transporters (boda riders, trucks, etc.)."""
    class VehicleType(models.TextChoices):
        MOTORCYCLE = "motorcycle", "Motorcycle (Boda)"
        BICYCLE = "bicycle", "Bicycle"
        VAN = "van", "Van"
        TRUCK = "truck", "Truck"
        PICKUP = "pickup", "Pickup"
        OTHER = "other", "Other"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="transporter_profile", null=True, blank=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    vehicle_type = models.CharField(max_length=20, choices=VehicleType.choices, default=VehicleType.MOTORCYCLE)
    vehicle_registration = models.CharField(max_length=50, blank=True)
    is_available = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    current_location = models.CharField(max_length=255, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_deliveries = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.get_vehicle_type_display()})"


class Shipment(models.Model):
    """Track physical movement of goods."""
    class Status(models.TextChoices):
        PENDING = "pending", "Pending Pickup"
        PICKED_UP = "picked_up", "Picked Up"
        IN_TRANSIT = "in_transit", "In Transit"
        DELIVERED = "delivered", "Delivered"
        FAILED = "failed", "Failed"
        RETURNED = "returned", "Returned"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shipment_number = models.CharField(max_length=30, unique=True)
    order = models.ForeignKey("orders.Order", on_delete=models.SET_NULL, null=True, blank=True, related_name="shipments")
    supply_chain_order = models.ForeignKey("supply_chain.SupplyChainOrder", on_delete=models.SET_NULL, null=True, blank=True, related_name="shipments")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="shipments_sent")
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="shipments_received")
    transporter = models.ForeignKey(Transporter, on_delete=models.SET_NULL, null=True, blank=True, related_name="shipments")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    pickup_address = models.TextField()
    delivery_address = models.TextField()
    estimated_delivery = models.DateTimeField(null=True, blank=True)
    actual_delivery = models.DateTimeField(null=True, blank=True)
    shipping_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    weight_kg = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Shipment {self.shipment_number}"

    def save(self, *args, **kwargs):
        if not self.shipment_number:
            self.shipment_number = f"SHP-{uuid.uuid4().hex[:12].upper()}"
        super().save(*args, **kwargs)


class ShipmentItem(models.Model):
    """Items in a shipment."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shipment = models.ForeignKey(Shipment, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey("products.Product", on_delete=models.SET_NULL, null=True)
    description = models.CharField(max_length=500)
    quantity = models.PositiveIntegerField(default=1)
    weight_kg = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.description} x{self.quantity}"


class Warehouse(models.Model):
    """Warehouse/storage facilities for inventory management."""
    class StorageType(models.TextChoices):
        DRY = "dry", "Dry Storage"
        COLD = "cold", "Cold Storage"
        FROZEN = "frozen", "Frozen Storage"
        GENERAL = "general", "General"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="warehouses")
    location = models.CharField(max_length=255)
    address = models.TextField(blank=True)
    region = models.CharField(max_length=100, blank=True)
    storage_type = models.CharField(max_length=20, choices=StorageType.choices, default=StorageType.GENERAL)
    capacity_kg = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    current_stock_kg = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.get_storage_type_display()})"

    @property
    def utilization_pct(self):
        if self.capacity_kg and self.capacity_kg > 0:
            return round((self.current_stock_kg / self.capacity_kg) * 100, 2)
        return 0


class WarehouseStock(models.Model):
    """Track stock items in a warehouse."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name="stock_items")
    product = models.ForeignKey("products.Product", on_delete=models.SET_NULL, null=True, blank=True, related_name="warehouse_stocks")
    batch = models.ForeignKey("aggregation.Batch", on_delete=models.SET_NULL, null=True, blank=True, related_name="warehouse_stocks")
    quantity_kg = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    quantity_units = models.PositiveIntegerField(default=0)
    location_in_warehouse = models.CharField(max_length=100, blank=True, help_text="Aisle/shelf/bin")
    received_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-received_at"]

    def __str__(self):
        item = self.product.name if self.product else f"Batch {self.batch}"
        return f"{item} in {self.warehouse.name}"


class DeliverySchedule(models.Model):
    """Scheduled deliveries linked to shipments."""
    class Priority(models.TextChoices):
        LOW = "low", "Low"
        NORMAL = "normal", "Normal"
        HIGH = "high", "High"
        URGENT = "urgent", "Urgent"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shipment = models.ForeignKey(Shipment, on_delete=models.CASCADE, related_name="schedules")
    pickup_time = models.DateTimeField()
    delivery_time = models.DateTimeField()
    route = models.TextField(blank=True, help_text="Route description or waypoints")
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.NORMAL)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-pickup_time"]

    def __str__(self):
        return f"Schedule for {self.shipment.shipment_number}"


class ShipmentTracking(models.Model):
    """GPS/status updates for shipments."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shipment = models.ForeignKey(Shipment, on_delete=models.CASCADE, related_name="tracking_updates")
    status = models.CharField(max_length=50)
    location = models.CharField(max_length=255, blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    notes = models.TextField(blank=True)
    conditions = models.CharField(max_length=255, blank=True, help_text="e.g. traffic, weather conditions")
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.shipment.shipment_number} - {self.status} at {self.timestamp}"
