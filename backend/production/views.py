from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from accounts.permissions import IsFarmer, IsFarmerOrCompany, IsSellerRole
from .models import Crop, PlantingRecord, HarvestRecord, LivestockRecord, PurchaseOffer, SupplyContract, HarvestForecast
from .serializers import (
    CropSerializer, PlantingRecordSerializer, HarvestRecordSerializer,
    LivestockRecordSerializer, PurchaseOfferSerializer,
    SupplyContractSerializer, HarvestForecastSerializer,
)


class CropViewSet(viewsets.ModelViewSet):
    queryset = Crop.objects.all()
    serializer_class = CropSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return []
        return [IsFarmerOrCompany()]


class PlantingRecordViewSet(viewsets.ModelViewSet):
    serializer_class = PlantingRecordSerializer
    permission_classes = [IsFarmer]

    def get_queryset(self):
        if self.request.user.role == "admin":
            return PlantingRecord.objects.all()
        return PlantingRecord.objects.filter(farmer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)


class HarvestRecordViewSet(viewsets.ModelViewSet):
    serializer_class = HarvestRecordSerializer
    permission_classes = [IsFarmer]

    def get_queryset(self):
        if self.request.user.role == "admin":
            return HarvestRecord.objects.all()
        return HarvestRecord.objects.filter(farmer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)


class LivestockRecordViewSet(viewsets.ModelViewSet):
    serializer_class = LivestockRecordSerializer
    permission_classes = [IsFarmer]

    def get_queryset(self):
        if self.request.user.role == "admin":
            return LivestockRecord.objects.all()
        return LivestockRecord.objects.filter(farmer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)


class PurchaseOfferViewSet(viewsets.ModelViewSet):
    serializer_class = PurchaseOfferSerializer
    permission_classes = [IsFarmerOrCompany]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return PurchaseOffer.objects.all()
        if user.role == "farmer":
            return PurchaseOffer.objects.filter(farmer=user)
        if user.role == "company":
            return PurchaseOffer.objects.filter(buyer=user)
        return PurchaseOffer.objects.none()

    def perform_create(self, serializer):
        serializer.save(buyer=self.request.user)

    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None):
        offer = self.get_object()
        if request.user != offer.farmer:
            return Response({"error": "Only the farmer can accept"}, status=status.HTTP_403_FORBIDDEN)
        offer.status = PurchaseOffer.Status.ACCEPTED
        offer.save()
        return Response(PurchaseOfferSerializer(offer).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        offer = self.get_object()
        if request.user != offer.farmer:
            return Response({"error": "Only the farmer can reject"}, status=status.HTTP_403_FORBIDDEN)
        offer.status = PurchaseOffer.Status.REJECTED
        offer.save()
        return Response(PurchaseOfferSerializer(offer).data)


class SupplyContractViewSet(viewsets.ModelViewSet):
    serializer_class = SupplyContractSerializer
    permission_classes = [IsFarmerOrCompany]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return SupplyContract.objects.all()
        if user.role == "farmer":
            return SupplyContract.objects.filter(farmer=user)
        return SupplyContract.objects.filter(buyer=user)

    def perform_create(self, serializer):
        serializer.save(buyer=self.request.user)


class HarvestForecastViewSet(viewsets.ModelViewSet):
    serializer_class = HarvestForecastSerializer
    permission_classes = [IsFarmer]

    def get_queryset(self):
        if self.request.user.role == "admin":
            return HarvestForecast.objects.all()
        return HarvestForecast.objects.filter(farmer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)
