from rest_framework import serializers
from .models import Transporter, Shipment, ShipmentItem, ShipmentTracking, Warehouse, WarehouseStock, DeliverySchedule


class TransporterSerializer(serializers.ModelSerializer):
    vehicle_type_display = serializers.CharField(source="get_vehicle_type_display", read_only=True)

    class Meta:
        model = Transporter
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class ShipmentItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShipmentItem
        fields = "__all__"
        read_only_fields = ["id"]


class ShipmentTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShipmentTracking
        fields = "__all__"
        read_only_fields = ["id", "timestamp"]


class ShipmentSerializer(serializers.ModelSerializer):
    items = ShipmentItemSerializer(many=True, read_only=True)
    tracking_updates = ShipmentTrackingSerializer(many=True, read_only=True)
    sender_name = serializers.CharField(source="sender.username", read_only=True)
    receiver_name = serializers.CharField(source="receiver.username", read_only=True)
    transporter_name = serializers.CharField(source="transporter.name", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Shipment
        fields = "__all__"
        read_only_fields = ["id", "shipment_number", "created_at", "updated_at"]


class WarehouseSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source="owner.username", read_only=True)
    utilization_pct = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    storage_type_display = serializers.CharField(source="get_storage_type_display", read_only=True)

    class Meta:
        model = Warehouse
        fields = "__all__"
        read_only_fields = ["id", "owner", "current_stock_kg", "created_at", "updated_at"]


class WarehouseStockSerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source="warehouse.name", read_only=True)
    product_name = serializers.SerializerMethodField()

    class Meta:
        model = WarehouseStock
        fields = "__all__"
        read_only_fields = ["id", "received_at", "updated_at"]

    def get_product_name(self, obj):
        if obj.product:
            return obj.product.name
        return f"Batch {obj.batch.batch_number}" if obj.batch else ""


class DeliveryScheduleSerializer(serializers.ModelSerializer):
    shipment_number = serializers.CharField(source="shipment.shipment_number", read_only=True)

    class Meta:
        model = DeliverySchedule
        fields = "__all__"
        read_only_fields = ["id", "created_at"]
