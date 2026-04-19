from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from accounts.permissions import IsSellerRole
from .models import Transporter, Shipment, ShipmentItem, ShipmentTracking
from .serializers import (
    TransporterSerializer, ShipmentSerializer,
    ShipmentItemSerializer, ShipmentTrackingSerializer,
)


class TransporterViewSet(viewsets.ModelViewSet):
    serializer_class = TransporterSerializer
    permission_classes = [IsSellerRole]

    def get_queryset(self):
        return Transporter.objects.all()

    def perform_update(self, serializer):
        if self.request.user.role != "admin" and serializer.instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only the transporter owner can modify this record.")
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role != "admin" and instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only the transporter owner can delete this record.")
        instance.delete()


class ShipmentViewSet(viewsets.ModelViewSet):
    serializer_class = ShipmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return Shipment.objects.all()
        return Shipment.objects.filter(Q(sender=user) | Q(receiver=user))

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    @action(detail=True, methods=["post"])
    def add_tracking(self, request, pk=None):
        shipment = self.get_object()
        serializer = ShipmentTrackingSerializer(data={**request.data, "shipment": shipment.pk})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        if "status" in request.data:
            new_status = request.data["status"]
            valid_statuses = [s.value for s in Shipment.Status]
            if new_status in valid_statuses:
                shipment.status = new_status
                shipment.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"])
    def tracking(self, request, pk=None):
        shipment = self.get_object()
        updates = shipment.tracking_updates.all()
        serializer = ShipmentTrackingSerializer(updates, many=True)
        return Response(serializer.data)


class ShipmentItemViewSet(viewsets.ModelViewSet):
    serializer_class = ShipmentItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ShipmentItem.objects.all()
