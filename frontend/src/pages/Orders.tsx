import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ordersAPI } from "../lib/api";
import { Order } from "../types";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { isAuthenticated } from "../store/auth";
import { Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react";

const statusConfig: Record<string, { color: "default" | "secondary" | "success" | "warning" | "destructive"; icon: typeof Clock }> = {
  pending: { color: "warning", icon: Clock },
  confirmed: { color: "default", icon: CheckCircle },
  processing: { color: "secondary", icon: Package },
  shipped: { color: "default", icon: Truck },
  in_transit: { color: "warning", icon: Truck },
  delivered: { color: "success", icon: CheckCircle },
  cancelled: { color: "destructive", icon: XCircle },
  refunded: { color: "destructive", icon: XCircle },
};

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    ordersAPI.list().then((res) => {
      const data = res.data;
      setOrders(Array.isArray(data) ? data : data.results || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [navigate]);

  const formatPrice = (price: string | number) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return `UGX ${num.toLocaleString()}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-UG", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-slate-600 mt-4">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
        <p className="text-slate-600 mt-1">Track and manage your orders</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="h-20 w-20 text-slate-200 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-700 mb-2">No orders yet</h2>
            <p className="text-slate-500 mb-6">Start shopping to see your orders here!</p>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate("/products")}>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const config = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            const isExpanded = expandedOrder === order.id;

            return (
              <Card key={order.id} className="overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <StatusIcon className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-900">Order #{order.order_number}</p>
                        <p className="text-sm text-slate-500">{formatDate(order.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={config.color}>{order.status.replace("_", " ")}</Badge>
                      <span className="font-bold text-emerald-600">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t px-4 pb-4">
                    <div className="mt-4 space-y-3">
                      <h4 className="font-medium text-sm text-slate-700">Items</h4>
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm bg-slate-50 p-2 rounded">
                          <span>{item.product_name} x{item.quantity}</span>
                          <span className="font-medium">{formatPrice(item.total_price)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-3 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Subtotal</span>
                          <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Tax</span>
                          <span>{formatPrice(order.tax)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Delivery Fee</span>
                          <span>{formatPrice(order.delivery_fee)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base pt-2 border-t">
                          <span>Total</span>
                          <span className="text-emerald-600">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                      {order.delivery_address && (
                        <div className="text-sm">
                          <span className="text-slate-600">Delivery to: </span>
                          <span>{order.delivery_address}</span>
                        </div>
                      )}
                      <div className="text-sm">
                        <span className="text-slate-600">Payment: </span>
                        <Badge variant="secondary">{order.payment_method?.replace("_", " ")}</Badge>
                        <Badge variant={order.payment_status === "paid" ? "success" : "warning"} className="ml-2">
                          {order.payment_status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
