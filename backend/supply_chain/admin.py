from django.contrib import admin
from .models import SupplyChainOrder, SupplyChainOrderItem, DeliveryTracking


class SupplyChainOrderItemInline(admin.TabularInline):
    model = SupplyChainOrderItem
    extra = 0


class DeliveryTrackingInline(admin.TabularInline):
    model = DeliveryTracking
    extra = 0
    readonly_fields = ("timestamp",)


@admin.register(SupplyChainOrder)
class SupplyChainOrderAdmin(admin.ModelAdmin):
    list_display = ("order_number", "buyer", "seller", "status", "total", "created_at")
    list_filter = ("status",)
    search_fields = ("order_number", "buyer__username", "seller__username")
    ordering = ("-created_at",)
    inlines = [SupplyChainOrderItemInline, DeliveryTrackingInline]


@admin.register(SupplyChainOrderItem)
class SupplyChainOrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "product", "quantity", "unit_price", "total_price")
    search_fields = ("order__order_number", "product__name")


@admin.register(DeliveryTracking)
class DeliveryTrackingAdmin(admin.ModelAdmin):
    list_display = ("order", "transporter_name", "current_location", "status", "estimated_arrival", "timestamp")
    list_filter = ("status",)
    search_fields = ("order__order_number", "transporter_name")
