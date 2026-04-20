from rest_framework import viewsets
from accounts.permissions import IsProcessorRole
from .models import ProcessingFacility, ProcessingJob, ProcessingCost, YieldRecord
from .serializers import (
    ProcessingFacilitySerializer, ProcessingJobSerializer,
    ProcessingCostSerializer, YieldRecordSerializer,
)


class ProcessingFacilityViewSet(viewsets.ModelViewSet):
    serializer_class = ProcessingFacilitySerializer
    permission_classes = [IsProcessorRole]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return ProcessingFacility.objects.all()
        return ProcessingFacility.objects.filter(owner=user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ProcessingJobViewSet(viewsets.ModelViewSet):
    serializer_class = ProcessingJobSerializer
    permission_classes = [IsProcessorRole]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return ProcessingJob.objects.all()
        return ProcessingJob.objects.filter(facility__owner=user)


class ProcessingCostViewSet(viewsets.ModelViewSet):
    serializer_class = ProcessingCostSerializer
    permission_classes = [IsProcessorRole]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return ProcessingCost.objects.all()
        return ProcessingCost.objects.filter(job__facility__owner=user)


class YieldRecordViewSet(viewsets.ModelViewSet):
    serializer_class = YieldRecordSerializer
    permission_classes = [IsProcessorRole]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return YieldRecord.objects.all()
        return YieldRecord.objects.filter(job__facility__owner=user)
