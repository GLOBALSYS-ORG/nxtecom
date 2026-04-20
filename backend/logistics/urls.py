from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TransporterViewSet, ShipmentViewSet, ShipmentItemViewSet,
    WarehouseViewSet, WarehouseStockViewSet, DeliveryScheduleViewSet,
)

router = DefaultRouter()
router.register("transporters", TransporterViewSet, basename="transporter")
router.register("shipments", ShipmentViewSet, basename="shipment")
router.register("shipment-items", ShipmentItemViewSet, basename="shipment-item")
router.register("warehouses", WarehouseViewSet, basename="warehouse")
router.register("warehouse-stock", WarehouseStockViewSet, basename="warehouse-stock")
router.register("delivery-schedules", DeliveryScheduleViewSet, basename="delivery-schedule")

urlpatterns = [
    path("", include(router.urls)),
]
