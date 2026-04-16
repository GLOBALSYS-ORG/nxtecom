from django.contrib import admin
from .models import Order, OrderItem, OrderTracking


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


class OrderTrackingInline(admin.TabularInline):
    model = OrderTracking
    extra = 0
    readonly_fields = ("timestamp",)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("order_number", "buyer", "status", "payment_status", "total", "created_at")
    list_filter = ("status", "payment_status", "payment_method")
    search_fields = ("order_number", "buyer__username", "delivery_address")
    ordering = ("-created_at",)
    inlines = [OrderItemInline, OrderTrackingInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "product_name", "quantity", "unit_price", "total_price")
    search_fields = ("product_name", "order__order_number")


@admin.register(OrderTracking)
class OrderTrackingAdmin(admin.ModelAdmin):
    list_display = ("order", "status", "location", "timestamp")
    list_filter = ("status",)
    search_fields = ("order__order_number",)
