from rest_framework import serializers
from .models import DemandForecast, SupplyDemandMatch, PricingRule, AnalyticsSnapshot


class DemandForecastSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    accuracy_score = serializers.DecimalField(source="accuracy", max_digits=5, decimal_places=2, read_only=True)

    class Meta:
        model = DemandForecast
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class SupplyDemandMatchSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = SupplyDemandMatch
        fields = "__all__"
        read_only_fields = ["id", "gap_kg", "computed_at"]


class PricingRuleSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = PricingRule
        fields = "__all__"
        read_only_fields = ["id", "created_by", "created_at"]


class AnalyticsSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticsSnapshot
        fields = "__all__"
        read_only_fields = ["id", "user", "created_at"]
