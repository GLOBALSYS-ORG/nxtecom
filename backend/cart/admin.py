from django.contrib import admin
from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ("added_at",)


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("user", "total_items", "subtotal", "created_at", "updated_at")
    search_fields = ("user__username",)
    inlines = [CartItemInline]


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ("cart", "product", "quantity", "unit_price", "line_total", "added_at")
    list_filter = ("seller_type",)
    search_fields = ("product__name", "cart__user__username")
