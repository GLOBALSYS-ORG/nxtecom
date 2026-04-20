from rest_framework import serializers
from .models import ProcessingFacility, ProcessingJob, ProcessingCost, YieldRecord


class ProcessingFacilitySerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source="owner.username", read_only=True)

    class Meta:
        model = ProcessingFacility
        fields = "__all__"
        read_only_fields = ["id", "owner", "created_at", "updated_at"]


class ProcessingJobSerializer(serializers.ModelSerializer):
    facility_name = serializers.CharField(source="facility.name", read_only=True)
    batch_number = serializers.CharField(source="input_batch.batch_number", read_only=True)
    output_product_name = serializers.CharField(source="output_product.name", read_only=True)
    yield_pct = serializers.DecimalField(source="yield_percentage", max_digits=5, decimal_places=2, read_only=True)
    total_cost = serializers.SerializerMethodField()

    class Meta:
        model = ProcessingJob
        fields = "__all__"
        read_only_fields = ["id", "job_number", "waste_kg", "created_at", "updated_at"]

    def get_total_cost(self, obj):
        return sum(c.amount for c in obj.costs.all())


class ProcessingCostSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessingCost
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class YieldRecordSerializer(serializers.ModelSerializer):
    job_number = serializers.CharField(source="job.job_number", read_only=True)

    class Meta:
        model = YieldRecord
        fields = "__all__"
        read_only_fields = ["id", "yield_percentage", "waste_kg", "recorded_at"]
