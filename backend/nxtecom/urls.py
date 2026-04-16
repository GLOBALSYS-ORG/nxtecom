from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def api_root(request):
    return Response({
        "message": "NxtEcom API v1",
        "endpoints": {
            "auth": "/api/auth/",
            "products": "/api/products/",
            "cart": "/api/cart/",
            "orders": "/api/orders/",
            "supply_chain": "/api/supply-chain/",
            "finance": "/api/finance/",
            "affiliate": "/api/affiliate/",
            "market": "/api/market/",
        },
    })


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", api_root, name="api-root"),
    path("api/auth/", include("accounts.urls")),
    path("api/products/", include("products.urls")),
    path("api/cart/", include("cart.urls")),
    path("api/orders/", include("orders.urls")),
    path("api/supply-chain/", include("supply_chain.urls")),
    path("api/finance/", include("finance.urls")),
    path("api/affiliate/", include("affiliate.urls")),
    path("api/market/", include("market.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
