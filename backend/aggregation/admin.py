from django.contrib import admin
from .models import AggregationCenter, Batch, IntakeRecord, QualityAssessment


@admin.register(AggregationCenter)
class AggregationCenterAdmin(admin.ModelAdmin):
    list_display = ["name", "manager", "center_type", "location", "region", "capacity_kg", "current_stock_kg", "is_active"]
    list_filter = ["center_type", "is_active", "region"]
    search_fields = ["name", "location"]


@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ["batch_number", "center", "crop", "total_quantity_kg", "quality_grade", "status", "created_at"]
    list_filter = ["status", "quality_grade"]
    search_fields = ["batch_number"]


@admin.register(IntakeRecord)
class IntakeRecordAdmin(admin.ModelAdmin):
    list_display = ["farmer", "center", "crop", "quantity_kg", "unit_price", "total_amount", "received_at"]
    list_filter = ["center"]
    search_fields = ["farmer__username"]


@admin.register(QualityAssessment)
class QualityAssessmentAdmin(admin.ModelAdmin):
    list_display = ["intake", "grade", "moisture_content", "impurity_pct", "assessed_by", "assessed_at"]
    list_filter = ["grade"]
