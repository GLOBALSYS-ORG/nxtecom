from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransporterViewSet, ShipmentViewSet, ShipmentItemViewSet

router = DefaultRouter()
router.register("transporters", TransporterViewSet, basename="transporter")
router.register("shipments", ShipmentViewSet, basename="shipment")
router.register("shipment-items", ShipmentItemViewSet, basename="shipment-item")

urlpatterns = [
    path("", include(router.urls)),
]
