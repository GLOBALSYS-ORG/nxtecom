from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("orders", views.SupplyChainOrderViewSet, basename="supply-chain-order")
router.register("delivery", views.DeliveryTrackingViewSet, basename="delivery-tracking")

urlpatterns = [
    path("", include(router.urls)),
]
