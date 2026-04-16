from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("prices", views.MarketPriceViewSet, basename="market-price")
router.register("alerts", views.PriceAlertViewSet, basename="price-alert")

urlpatterns = [
    path("", include(router.urls)),
]
