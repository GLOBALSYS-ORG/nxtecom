from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, CompanyProfile, DepotProfile,
    WholesalerProfile, RetailerProfile, CustomerProfile,
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("username", "email", "role", "digital_id", "is_verified", "is_active", "created_at")
    list_filter = ("role", "is_verified", "is_active", "is_staff")
    search_fields = ("username", "email", "digital_id", "phone")
    ordering = ("-created_at",)
    fieldsets = BaseUserAdmin.fieldsets + (
        ("NxtEcom", {"fields": ("role", "phone", "national_id", "digital_id", "is_verified", "device_info")}),
    )


@admin.register(CompanyProfile)
class CompanyProfileAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "city", "region", "is_active", "created_at")
    list_filter = ("is_active", "region")
    search_fields = ("name", "user__username", "contact_email")


@admin.register(DepotProfile)
class DepotProfileAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "company", "city", "region", "capacity", "is_active")
    list_filter = ("is_active", "region")
    search_fields = ("name", "user__username", "location")


@admin.register(WholesalerProfile)
class WholesalerProfileAdmin(admin.ModelAdmin):
    list_display = ("business_name", "user", "city", "region", "is_active", "created_at")
    list_filter = ("is_active", "region")
    search_fields = ("business_name", "user__username", "license_number")


@admin.register(RetailerProfile)
class RetailerProfileAdmin(admin.ModelAdmin):
    list_display = ("shop_name", "user", "city", "region", "subscription_plan", "is_online", "is_active")
    list_filter = ("subscription_plan", "is_online", "is_active", "region")
    search_fields = ("shop_name", "user__username")


@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "city", "region", "preferred_payment", "created_at")
    list_filter = ("region",)
    search_fields = ("user__username",)
