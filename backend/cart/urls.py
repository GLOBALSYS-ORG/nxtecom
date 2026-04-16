from django.urls import path
from . import views

urlpatterns = [
    path("", views.CartView.as_view(), name="cart"),
    path("items/", views.AddToCartView.as_view(), name="add-to-cart"),
    path("items/<uuid:item_id>/", views.UpdateCartItemView.as_view(), name="update-cart-item"),
    path("items/<uuid:item_id>/remove/", views.RemoveCartItemView.as_view(), name="remove-cart-item"),
    path("clear/", views.ClearCartView.as_view(), name="clear-cart"),
]
