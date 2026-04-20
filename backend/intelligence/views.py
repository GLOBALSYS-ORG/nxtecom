from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsSellerRole, IsCompanyOrAdmin
from .models import DemandForecast, SupplyDemandMatch, PricingRule, AnalyticsSnapshot
from .serializers import (
    DemandForecastSerializer, SupplyDemandMatchSerializer,
    PricingRuleSerializer, AnalyticsSnapshotSerializer,
)


class DemandForecastViewSet(viewsets.ModelViewSet):
    serializer_class = DemandForecastSerializer
    permission_classes = [IsSellerRole]

    def get_queryset(self):
        qs = DemandForecast.objects.all()
        region = self.request.query_params.get("region")
        if region:
            qs = qs.filter(region__icontains=region)
        return qs


class SupplyDemandMatchViewSet(viewsets.ModelViewSet):
    serializer_class = SupplyDemandMatchSerializer
    permission_classes = [IsSellerRole]

    def get_queryset(self):
        qs = SupplyDemandMatch.objects.all()
        region = self.request.query_params.get("region")
        if region:
            qs = qs.filter(region__icontains=region)
        return qs


class PricingRuleViewSet(viewsets.ModelViewSet):
    serializer_class = PricingRuleSerializer
    permission_classes = [IsSellerRole]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return PricingRule.objects.all()
        return PricingRule.objects.filter(created_by=user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class AnalyticsSnapshotViewSet(viewsets.ModelViewSet):
    serializer_class = AnalyticsSnapshotSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return AnalyticsSnapshot.objects.all()
        return AnalyticsSnapshot.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
