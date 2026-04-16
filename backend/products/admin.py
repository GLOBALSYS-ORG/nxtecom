from django.contrib import admin
from .models import Category, Product, Inventory, PriceList


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "parent", "created_at")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "sku", "category", "base_price", "unit", "is_active", "created_by", "created_at")
    list_filter = ("is_active", "category", "unit")
    search_fields = ("name", "sku", "description")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ("product", "owner_type", "owner_id", "quantity", "reorder_level", "last_restocked", "updated_at")
    list_filter = ("owner_type",)
    search_fields = ("product__name",)


@admin.register(PriceList)
class PriceListAdmin(admin.ModelAdmin):
    list_display = ("product", "seller_type", "seller_id", "price", "min_order_qty", "is_active")
    list_filter = ("seller_type", "is_active")
    search_fields = ("product__name",)
