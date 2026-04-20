from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from accounts.permissions import IsAggregatorRole, IsFarmerOrCompany
from .models import AggregationCenter, Batch, IntakeRecord, QualityAssessment
from .serializers import (
    AggregationCenterSerializer, BatchSerializer,
    IntakeRecordSerializer, QualityAssessmentSerializer,
)


class AggregationCenterViewSet(viewsets.ModelViewSet):
    serializer_class = AggregationCenterSerializer
    permission_classes = [IsAggregatorRole]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return AggregationCenter.objects.all()
        return AggregationCenter.objects.filter(manager=user)

    def perform_create(self, serializer):
        serializer.save(manager=self.request.user)


class BatchViewSet(viewsets.ModelViewSet):
    serializer_class = BatchSerializer
    permission_classes = [IsAggregatorRole]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return Batch.objects.all()
        return Batch.objects.filter(center__manager=user)


class IntakeRecordViewSet(viewsets.ModelViewSet):
    serializer_class = IntakeRecordSerializer
    permission_classes = [IsAggregatorRole]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return IntakeRecord.objects.all()
        if user.role == "farmer":
            return IntakeRecord.objects.filter(farmer=user)
        return IntakeRecord.objects.filter(center__manager=user)

    def perform_create(self, serializer):
        serializer.save(received_by=self.request.user)

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            # Allow depot/aggregator users to view intake records too
            if hasattr(self.request, 'user') and self.request.user.is_authenticated and self.request.user.role in ("depot", "admin"):
                return [IsAggregatorRole()]
            return [IsFarmerOrCompany()]
        return [IsAggregatorRole()]


class QualityAssessmentViewSet(viewsets.ModelViewSet):
    serializer_class = QualityAssessmentSerializer
    permission_classes = [IsAggregatorRole]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return QualityAssessment.objects.all()
        return QualityAssessment.objects.filter(intake__center__manager=user)

    def perform_create(self, serializer):
        serializer.save(assessed_by=self.request.user)
