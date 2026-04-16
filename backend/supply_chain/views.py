from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import SupplyChainOrder, DeliveryTracking
from .serializers import SupplyChainOrderSerializer, DeliveryTrackingSerializer


class SupplyChainOrderViewSet(viewsets.ModelViewSet):
    serializer_class = SupplyChainOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return SupplyChainOrder.objects.all()
        return (
            SupplyChainOrder.objects.filter(buyer=user)
            | SupplyChainOrder.objects.filter(seller=user)
        )

    @action(detail=True, methods=["post"])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get("status")
        if new_status not in dict(SupplyChainOrder.Status.choices):
            return Response({"error": "Invalid status."}, status=400)
        order.status = new_status
        order.save()
        return Response(SupplyChainOrderSerializer(order).data)


class DeliveryTrackingViewSet(viewsets.ModelViewSet):
    serializer_class = DeliveryTrackingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DeliveryTracking.objects.all()
