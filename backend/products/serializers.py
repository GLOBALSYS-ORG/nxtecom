from rest_framework import serializers
from .models import Category, Product, Inventory, PriceList


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True, default="")

    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "description", "sku", "category",
            "category_name", "base_price", "weight", "unit", "image",
            "is_active", "created_by", "created_at",
        ]
        read_only_fields = ["id", "created_by", "created_at"]


class InventorySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Inventory
        fields = "__all__"


class PriceListSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = PriceList
        fields = "__all__"
