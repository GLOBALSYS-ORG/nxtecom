from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CropViewSet, PlantingRecordViewSet, HarvestRecordViewSet,
    LivestockRecordViewSet, PurchaseOfferViewSet,
    SupplyContractViewSet, HarvestForecastViewSet,
)

router = DefaultRouter()
router.register("crops", CropViewSet, basename="crop")
router.register("planting", PlantingRecordViewSet, basename="planting")
router.register("harvests", HarvestRecordViewSet, basename="harvest")
router.register("livestock", LivestockRecordViewSet, basename="livestock")
router.register("purchase-offers", PurchaseOfferViewSet, basename="purchase-offer")
router.register("supply-contracts", SupplyContractViewSet, basename="supply-contract")
router.register("harvest-forecasts", HarvestForecastViewSet, basename="harvest-forecast")

urlpatterns = [
    path("", include(router.urls)),
]
