from django.contrib import admin
from .models import Transporter, Shipment, ShipmentItem, ShipmentTracking, Warehouse, WarehouseStock, DeliverySchedule


@admin.register(Transporter)
class TransporterAdmin(admin.ModelAdmin):
    list_display = ["name", "phone", "vehicle_type", "is_available", "is_verified", "rating", "total_deliveries"]
    list_filter = ["vehicle_type", "is_available", "is_verified"]
    search_fields = ["name", "phone"]


@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = ["shipment_number", "sender", "receiver", "status", "shipping_cost", "created_at"]
    list_filter = ["status"]
    search_fields = ["shipment_number", "sender__username", "receiver__username"]


@admin.register(ShipmentItem)
class ShipmentItemAdmin(admin.ModelAdmin):
    list_display = ["shipment", "description", "quantity", "weight_kg"]
    search_fields = ["description"]


@admin.register(ShipmentTracking)
class ShipmentTrackingAdmin(admin.ModelAdmin):
    list_display = ["shipment", "status", "location", "conditions", "timestamp"]
    list_filter = ["status"]


@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ["name", "owner", "location", "region", "storage_type", "capacity_kg", "current_stock_kg", "is_active"]
    list_filter = ["storage_type", "is_active"]
    search_fields = ["name", "owner__username", "location"]


@admin.register(WarehouseStock)
class WarehouseStockAdmin(admin.ModelAdmin):
    list_display = ["warehouse", "product", "batch", "quantity_kg", "quantity_units", "received_at"]
    search_fields = ["warehouse__name"]


@admin.register(DeliverySchedule)
class DeliveryScheduleAdmin(admin.ModelAdmin):
    list_display = ["shipment", "pickup_time", "delivery_time", "priority", "route"]
    list_filter = ["priority"]
