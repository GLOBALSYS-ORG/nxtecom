from rest_framework import serializers
from .models import Crop, PlantingRecord, HarvestRecord, LivestockRecord, PurchaseOffer


class CropSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crop
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class PlantingRecordSerializer(serializers.ModelSerializer):
    crop_name = serializers.CharField(source="crop.name", read_only=True)

    class Meta:
        model = PlantingRecord
        fields = "__all__"
        read_only_fields = ["id", "farmer", "created_at", "updated_at"]


class HarvestRecordSerializer(serializers.ModelSerializer):
    crop_name = serializers.SerializerMethodField()

    class Meta:
        model = HarvestRecord
        fields = "__all__"
        read_only_fields = ["id", "farmer", "created_at"]

    def get_crop_name(self, obj):
        return obj.planting_record.crop.name if obj.planting_record else ""


class LivestockRecordSerializer(serializers.ModelSerializer):
    animal_type_display = serializers.CharField(source="get_animal_type_display", read_only=True)

    class Meta:
        model = LivestockRecord
        fields = "__all__"
        read_only_fields = ["id", "farmer", "created_at", "updated_at"]


class PurchaseOfferSerializer(serializers.ModelSerializer):
    buyer_name = serializers.CharField(source="buyer.username", read_only=True)
    farmer_name = serializers.CharField(source="farmer.username", read_only=True)
    crop_name = serializers.CharField(source="crop.name", read_only=True)

    class Meta:
        model = PurchaseOffer
        fields = "__all__"
        read_only_fields = ["id", "total_amount", "created_at", "updated_at"]
