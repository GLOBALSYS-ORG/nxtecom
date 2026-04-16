import uuid
from django.db import models
from django.conf import settings
from products.models import Product


class SupplyChainOrder(models.Model):
    """B2B orders between supply chain participants."""
    class Status(models.TextChoices):
        REQUESTED = "requested", "Requested"
        APPROVED = "approved", "Approved"
        PROCESSING = "processing", "Processing"
        SHIPPED = "shipped", "Shipped"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=20, unique=True)
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="supply_orders_placed")
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="supply_orders_received")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.REQUESTED)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"SC-{self.order_number}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            import time
            self.order_number = f"SC-{int(time.time())}"
        super().save(*args, **kwargs)


class SupplyChainOrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(SupplyChainOrder, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)

    def save(self, *args, **kwargs):
        self.total_price = self.unit_price * self.quantity
        super().save(*args, **kwargs)


class DeliveryTracking(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(SupplyChainOrder, on_delete=models.CASCADE, related_name="delivery_tracking")
    transporter_name = models.CharField(max_length=255, blank=True)
    transporter_phone = models.CharField(max_length=20, blank=True)
    current_location = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=50, blank=True)
    estimated_arrival = models.DateTimeField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]
