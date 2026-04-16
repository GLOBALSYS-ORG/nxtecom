from rest_framework import serializers
from .models import SupplyChainOrder, SupplyChainOrderItem, DeliveryTracking


class SupplyChainOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = SupplyChainOrderItem
        fields = "__all__"
        read_only_fields = ["id", "total_price"]


class DeliveryTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryTracking
        fields = "__all__"
        read_only_fields = ["id", "timestamp"]


class SupplyChainOrderSerializer(serializers.ModelSerializer):
    items = SupplyChainOrderItemSerializer(many=True, read_only=True)
    delivery_tracking = DeliveryTrackingSerializer(many=True, read_only=True)
    buyer_name = serializers.CharField(source="buyer.username", read_only=True)
    seller_name = serializers.CharField(source="seller.username", read_only=True)

    class Meta:
        model = SupplyChainOrder
        fields = "__all__"
        read_only_fields = ["id", "order_number", "created_at", "updated_at"]
