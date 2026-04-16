from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Order, OrderItem, OrderTracking
from .serializers import OrderSerializer, OrderTrackingSerializer, CreateOrderSerializer
from cart.models import Cart


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return Order.objects.all()
        return Order.objects.filter(buyer=user)

    @action(detail=True, methods=["post"])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get("status")
        if new_status not in dict(Order.Status.choices):
            return Response({"error": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)
        order.status = new_status
        order.save()
        OrderTracking.objects.create(
            order=order,
            status=new_status,
            location=request.data.get("location", ""),
            notes=request.data.get("notes", ""),
        )
        return Response(OrderSerializer(order).data)


class CreateOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({"error": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        cart_items = cart.items.all()
        if not cart_items.exists():
            return Response({"error": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        first_item = cart_items.first()
        order = Order.objects.create(
            buyer=request.user,
            seller_type=first_item.seller_type or "retailer",
            seller_id=first_item.seller_id or request.user.id,
            delivery_address=serializer.validated_data["delivery_address"],
            payment_method=serializer.validated_data["payment_method"],
            notes=serializer.validated_data.get("notes", ""),
        )

        subtotal = 0
        for item in cart_items:
            line_total = item.unit_price * item.quantity
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                quantity=item.quantity,
                unit_price=item.unit_price,
                total_price=line_total,
            )
            subtotal += line_total

        order.subtotal = subtotal
        order.total = subtotal + order.tax + order.delivery_fee
        order.save()

        OrderTracking.objects.create(
            order=order,
            status="pending",
            notes="Order placed successfully.",
        )

        cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
