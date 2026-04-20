from rest_framework import serializers
from .models import AggregationCenter, Batch, IntakeRecord, QualityAssessment


class AggregationCenterSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source="manager.username", read_only=True)

    class Meta:
        model = AggregationCenter
        fields = "__all__"
        read_only_fields = ["id", "manager", "current_stock_kg", "created_at", "updated_at"]


class BatchSerializer(serializers.ModelSerializer):
    center_name = serializers.CharField(source="center.name", read_only=True)
    crop_name = serializers.CharField(source="crop.name", read_only=True)
    intake_count = serializers.SerializerMethodField()

    class Meta:
        model = Batch
        fields = "__all__"
        read_only_fields = ["id", "batch_number", "total_quantity_kg", "created_at", "updated_at"]

    def get_intake_count(self, obj):
        return obj.intakes.count()


class IntakeRecordSerializer(serializers.ModelSerializer):
    farmer_name = serializers.CharField(source="farmer.username", read_only=True)
    center_name = serializers.CharField(source="center.name", read_only=True)
    crop_name = serializers.CharField(source="crop.name", read_only=True)

    class Meta:
        model = IntakeRecord
        fields = "__all__"
        read_only_fields = ["id", "total_amount", "received_by", "received_at"]


class QualityAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = QualityAssessment
        fields = "__all__"
        read_only_fields = ["id", "assessed_by", "assessed_at"]
