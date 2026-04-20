from django.contrib import admin
from .models import Crop, PlantingRecord, HarvestRecord, LivestockRecord, PurchaseOffer, SupplyContract, HarvestForecast


@admin.register(Crop)
class CropAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "growing_season", "avg_yield_per_acre"]
    search_fields = ["name", "category"]


@admin.register(PlantingRecord)
class PlantingRecordAdmin(admin.ModelAdmin):
    list_display = ["crop", "farmer", "field_name", "planting_date", "status"]
    list_filter = ["status", "crop"]
    search_fields = ["field_name", "farmer__username"]


@admin.register(HarvestRecord)
class HarvestRecordAdmin(admin.ModelAdmin):
    list_display = ["planting_record", "farmer", "harvest_date", "yield_kg", "quality_grade"]
    list_filter = ["quality_grade"]
    search_fields = ["farmer__username"]


@admin.register(LivestockRecord)
class LivestockRecordAdmin(admin.ModelAdmin):
    list_display = ["animal_type", "breed", "count", "health_status", "farmer"]
    list_filter = ["animal_type", "health_status"]
    search_fields = ["farmer__username", "breed"]


@admin.register(PurchaseOffer)
class PurchaseOfferAdmin(admin.ModelAdmin):
    list_display = ["product_description", "buyer", "farmer", "quantity_kg", "price_per_kg", "total_amount", "status"]
    list_filter = ["status"]
    search_fields = ["product_description", "buyer__username", "farmer__username"]


@admin.register(SupplyContract)
class SupplyContractAdmin(admin.ModelAdmin):
    list_display = ["contract_number", "farmer", "buyer", "crop", "committed_quantity_kg", "price_per_kg", "total_value", "status"]
    list_filter = ["status"]
    search_fields = ["contract_number", "farmer__username", "buyer__username"]


@admin.register(HarvestForecast)
class HarvestForecastAdmin(admin.ModelAdmin):
    list_display = ["farmer", "planting_record", "estimated_yield_kg", "forecast_date", "confidence"]
    search_fields = ["farmer__username"]
