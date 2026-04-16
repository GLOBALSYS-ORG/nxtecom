from django.contrib import admin
from .models import MarketPrice, PriceAlert


@admin.register(MarketPrice)
class MarketPriceAdmin(admin.ModelAdmin):
    list_display = ("product", "market_name", "location", "price", "recorded_at")
    list_filter = ("market_name", "location")
    search_fields = ("product__name", "market_name")
    ordering = ("-recorded_at",)


@admin.register(PriceAlert)
class PriceAlertAdmin(admin.ModelAdmin):
    list_display = ("user", "product", "target_price", "direction", "is_active", "created_at")
    list_filter = ("direction", "is_active")
    search_fields = ("user__username", "product__name")
