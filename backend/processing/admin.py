from django.contrib import admin
from .models import ProcessingFacility, ProcessingJob, ProcessingCost, YieldRecord


@admin.register(ProcessingFacility)
class ProcessingFacilityAdmin(admin.ModelAdmin):
    list_display = ["name", "owner", "facility_type", "location", "capacity_kg_per_day", "is_active"]
    list_filter = ["facility_type", "is_active"]
    search_fields = ["name"]


@admin.register(ProcessingJob)
class ProcessingJobAdmin(admin.ModelAdmin):
    list_display = ["job_number", "facility", "input_batch", "output_product", "input_quantity_kg", "output_quantity_kg", "status", "created_at"]
    list_filter = ["status"]
    search_fields = ["job_number"]


@admin.register(ProcessingCost)
class ProcessingCostAdmin(admin.ModelAdmin):
    list_display = ["job", "cost_type", "amount", "description", "created_at"]
    list_filter = ["cost_type"]


@admin.register(YieldRecord)
class YieldRecordAdmin(admin.ModelAdmin):
    list_display = ["job", "input_kg", "output_kg", "waste_kg", "yield_percentage", "recorded_at"]
