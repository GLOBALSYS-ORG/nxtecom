from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    CompanyProfile, DepotProfile, WholesalerProfile,
    RetailerProfile, CustomerProfile,
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name",
            "phone", "role", "digital_id", "is_verified", "created_at",
        ]
        read_only_fields = ["id", "digital_id", "is_verified", "created_at"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username", "email", "password", "password_confirm",
            "first_name", "last_name", "phone", "role",
        ]

    def validate(self, data):
        if data["password"] != data["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        role = validated_data.get("role", User.Role.CUSTOMER)
        if role == User.Role.COMPANY:
            CompanyProfile.objects.create(user=user, name=f"{user.first_name}'s Company")
        elif role == User.Role.DEPOT:
            DepotProfile.objects.create(user=user, name=f"{user.first_name}'s Depot")
        elif role == User.Role.WHOLESALER:
            WholesalerProfile.objects.create(user=user, business_name=f"{user.first_name}'s Wholesale")
        elif role == User.Role.RETAILER:
            RetailerProfile.objects.create(user=user, shop_name=f"{user.first_name}'s Shop")
        elif role == User.Role.CUSTOMER:
            CustomerProfile.objects.create(user=user)
        return user


class CompanyProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = CompanyProfile
        fields = "__all__"


class DepotProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = DepotProfile
        fields = "__all__"


class WholesalerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = WholesalerProfile
        fields = "__all__"


class RetailerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = RetailerProfile
        fields = "__all__"


class CustomerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = CustomerProfile
        fields = "__all__"
