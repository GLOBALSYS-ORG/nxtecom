import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ordersAPI, productsAPI } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { isAuthenticated, getUser } from "../store/auth";
import {
  Package, ShoppingCart, DollarSign, TrendingUp,
  BarChart3, AlertTriangle, CreditCard,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const [stats, setStats] = useState({ orders: 0, products: 0, revenue: 0, pending: 0 });
  const [recentOrders, setRecentOrders] = useState<Array<{ id: string; order_number: string; status: string; total: string; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    loadDashboard();
  }, [navigate]);

  const loadDashboard = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        ordersAPI.list().catch(() => ({ data: [] })),
        productsAPI.list().catch(() => ({ data: [] })),
      ]);

      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data.results || [];
      const products = Array.isArray(productsRes.data) ? productsRes.data : productsRes.data.results || [];

      const revenue = orders.reduce((sum: number, o: { total?: string }) => sum + parseFloat(o.total || "0"), 0);
      const pending = orders.filter((o: { status?: string }) => o.status === "pending").length;

      setStats({
        orders: orders.length,
        products: products.length,
        revenue,
        pending,
      });
      setRecentOrders(orders.slice(0, 5));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => `UGX ${price.toLocaleString()}`;

  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User";

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-slate-600 mt-4">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">
          Welcome back, {user?.first_name || user?.username}!{" "}
          <Badge variant="secondary">{roleLabel}</Badge>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Orders</p>
                <p className="text-2xl font-bold">{stats.orders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Products</p>
                <p className="text-2xl font-bold">{stats.products}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Spent</p>
                <p className="text-2xl font-bold">{formatPrice(stats.revenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-slate-500 text-sm">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <div>
                      <p className="text-sm font-medium">#{order.order_number}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{order.status}</Badge>
                      <span className="text-sm font-medium">{`UGX ${parseFloat(order.total).toLocaleString()}`}</span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/orders")}>
                  View All Orders
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate("/products")}
              >
                <Package className="h-6 w-6 text-emerald-600" />
                <span className="text-xs">Browse Products</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate("/cart")}
              >
                <ShoppingCart className="h-6 w-6 text-blue-600" />
                <span className="text-xs">View Cart</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate("/orders")}
              >
                <TrendingUp className="h-6 w-6 text-green-600" />
                <span className="text-xs">My Orders</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate("/products")}
              >
                <BarChart3 className="h-6 w-6 text-purple-600" />
                <span className="text-xs">Market Prices</span>
              </Button>
            </div>

            {/* Payment Gateways - Seller Only */}
            {(user?.role === "retailer" || user?.role === "wholesaler" || user?.role === "company" || user?.role === "depot") && (
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate("/payment-gateways")}
              >
                <CreditCard className="h-6 w-6 text-orange-600" />
                <span className="text-xs">Payment Gateways</span>
              </Button>
            )}

            {/* Role-Specific Info */}
            {(user?.role === "retailer" || user?.role === "wholesaler" || user?.role === "company") && (
              <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
                <h4 className="font-medium text-emerald-800 mb-2">Business Tools</h4>
                <p className="text-sm text-emerald-700">
                  As a {roleLabel}, you have access to inventory management, supply chain ordering,
                  and financial reporting tools. Configure your{" "}
                  <button onClick={() => navigate("/payment-gateways")} className="underline font-medium">
                    payment gateways
                  </button>{" "}
                  to accept payments from customers.
                </p>
              </div>
            )}

            {user?.role === "affiliate" && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Affiliate Dashboard</h4>
                <p className="text-sm text-blue-700">
                  Track your referrals, earnings, and withdrawals. Earn 20% commission on subscription renewals.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
