from rest_framework import serializers
from .models import Order, OrderItem, OrderTracking


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = "__all__"
        read_only_fields = ["id", "total_price"]


class OrderTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderTracking
        fields = "__all__"
        read_only_fields = ["id", "timestamp"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    tracking_updates = OrderTrackingSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = "__all__"
        read_only_fields = [
            "id", "order_number", "buyer", "subtotal",
            "total", "created_at", "updated_at",
        ]


class CreateOrderSerializer(serializers.Serializer):
    delivery_address = serializers.CharField()
    payment_method = serializers.CharField(default="mobile_money")
    notes = serializers.CharField(required=False, default="", allow_blank=True)
