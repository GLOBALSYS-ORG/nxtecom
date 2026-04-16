from rest_framework import viewsets, permissions
from .models import MarketPrice, PriceAlert
from .serializers import MarketPriceSerializer, PriceAlertSerializer


class MarketPriceViewSet(viewsets.ModelViewSet):
    serializer_class = MarketPriceSerializer
    queryset = MarketPrice.objects.all()

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


class PriceAlertViewSet(viewsets.ModelViewSet):
    serializer_class = PriceAlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PriceAlert.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
