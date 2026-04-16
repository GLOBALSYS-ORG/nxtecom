from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("categories", views.CategoryViewSet)
router.register("items", views.ProductViewSet, basename="product")
router.register("inventory", views.InventoryViewSet, basename="inventory")
router.register("prices", views.PriceListViewSet, basename="pricelist")

urlpatterns = [
    path("", include(router.urls)),
]
