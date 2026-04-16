from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("profile/", views.ProfileView.as_view(), name="profile"),
    path("retailers/", views.RetailerListView.as_view(), name="retailer-list"),
    path("wholesalers/", views.WholesalerListView.as_view(), name="wholesaler-list"),
    path("companies/", views.CompanyListView.as_view(), name="company-list"),
]
