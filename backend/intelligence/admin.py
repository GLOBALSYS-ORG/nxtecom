from django.contrib import admin
from .models import DemandForecast, SupplyDemandMatch, PricingRule, AnalyticsSnapshot


@admin.register(DemandForecast)
class DemandForecastAdmin(admin.ModelAdmin):
    list_display = ["product", "region", "period", "period_start", "predicted_demand_qty", "confidence", "actual_demand_qty"]
    list_filter = ["period", "region"]
    search_fields = ["product__name"]


@admin.register(SupplyDemandMatch)
class SupplyDemandMatchAdmin(admin.ModelAdmin):
    list_display = ["product", "region", "supply_available_kg", "demand_forecast_kg", "gap_kg", "recommended_action"]
    list_filter = ["recommended_action", "region"]


@admin.register(PricingRule)
class PricingRuleAdmin(admin.ModelAdmin):
    list_display = ["name", "product", "category", "rule_type", "price_modifier", "is_active", "start_date", "end_date"]
    list_filter = ["rule_type", "is_active"]
    search_fields = ["name"]


@admin.register(AnalyticsSnapshot)
class AnalyticsSnapshotAdmin(admin.ModelAdmin):
    list_display = ["user", "snapshot_type", "period_start", "period_end", "created_at"]
    list_filter = ["snapshot_type"]
