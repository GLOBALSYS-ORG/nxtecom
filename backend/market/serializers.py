from rest_framework import serializers
from .models import MarketPrice, PriceAlert


class MarketPriceSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = MarketPrice
        fields = "__all__"
        read_only_fields = ["id", "recorded_at"]


class PriceAlertSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = PriceAlert
        fields = "__all__"
        read_only_fields = ["id", "created_at"]
