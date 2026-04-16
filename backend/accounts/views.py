from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import (
    UserSerializer, RegisterSerializer,
    CompanyProfileSerializer, RetailerProfileSerializer,
    WholesalerProfileSerializer,
)
from .models import CompanyProfile, RetailerProfile, WholesalerProfile

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "user": UserSerializer(user).data,
                "message": "Registration successful.",
            },
            status=status.HTTP_201_CREATED,
        )


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class RetailerListView(generics.ListAPIView):
    serializer_class = RetailerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RetailerProfile.objects.filter(is_active=True)


class WholesalerListView(generics.ListAPIView):
    serializer_class = WholesalerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ("retailer", "wholesaler", "admin"):
            return WholesalerProfile.objects.filter(is_active=True)
        return WholesalerProfile.objects.none()


class CompanyListView(generics.ListAPIView):
    serializer_class = CompanyProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ("wholesaler", "company", "admin"):
            return CompanyProfile.objects.filter(is_active=True)
        return CompanyProfile.objects.none()
