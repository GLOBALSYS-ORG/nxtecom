from rest_framework import serializers
from .models import Transporter, Shipment, ShipmentItem, ShipmentTracking


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
