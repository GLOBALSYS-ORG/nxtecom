from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("", views.OrderViewSet, basename="order")

urlpatterns = [
    path("create/", views.CreateOrderView.as_view(), name="create-order"),
    path("", include(router.urls)),
]
