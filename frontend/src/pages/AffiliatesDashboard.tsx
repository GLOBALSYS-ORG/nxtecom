import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { affiliateExtAPI } from "../lib/api";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { isAuthenticated } from "../store/auth";
import { Users, ShoppingBag, TrendingUp, ArrowLeft } from "lucide-react";

interface AffiliateProduct {
  id: string;
  product_name: string;
  affiliate_name: string;
  custom_price: string;
  commission_rate: string;
  is_active: boolean;
  created_at: string;
}
interface Performance {
  id: string;
  affiliate_name: string;
  period: string;
  orders_generated: number;
  revenue_generated: string;
  commission_earned: string;
  conversion_rate: string;
  created_at: string;
}

type Tab = "products" | "performance";

export default function AffiliatesDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [performance, setPerformance] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { navigate("/login"); return; }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [pRes, perfRes] = await Promise.all([
        affiliateExtAPI.products().catch(() => ({ data: [] })),
        affiliateExtAPI.performance().catch(() => ({ data: [] })),
      ]);
      const arr = (d: unknown) => {
        const data = d as Record<string, unknown>;
        return Array.isArray(data) ? data : (data.results as unknown[]) || [];
      };
      setProducts(arr(pRes.data) as AffiliateProduct[]);
      setPerformance(arr(perfRes.data) as Performance[]);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const totalRevenue = performance.reduce((s, p) => s + Number(p.revenue_generated || 0), 0);
  const totalCommission = performance.reduce((s, p) => s + Number(p.commission_earned || 0), 0);
  const totalConversions = performance.reduce((s, p) => s + (p.orders_generated || 0), 0);

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-12 text-center">
      <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto" />
      <p className="text-slate-600 mt-4">Loading affiliate data...</p>
    </div>
  );

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "products", label: "Affiliate Products", count: products.length },
    { key: "performance", label: "Performance", count: performance.length },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Affiliate Sales</h1>
          <p className="text-slate-600">Product listings, performance metrics, and commission tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="pt-6 text-center">
          <ShoppingBag className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{products.length}</p>
          <p className="text-sm text-slate-500">Products</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{totalConversions}</p>
          <p className="text-sm text-slate-500">Conversions</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">UGX {totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-slate-500">Total Revenue</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <TrendingUp className="h-8 w-8 text-amber-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">UGX {totalCommission.toLocaleString()}</p>
          <p className="text-sm text-slate-500">Total Commission</p>
        </CardContent></Card>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-2">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${tab === t.key ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600" : "text-slate-600 hover:text-slate-900"}`}>
            {t.label} <Badge variant="secondary" className="ml-1">{t.count}</Badge>
          </button>
        ))}
      </div>

      {tab === "products" && (
        <div className="space-y-4">
          {products.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-slate-500">No affiliate products linked yet. Link products to start earning commissions.</CardContent></Card>
          ) : products.map((p) => (
            <Card key={p.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{p.product_name}</p>
                    <p className="text-sm text-slate-600">Affiliate: {p.affiliate_name}</p>
                    {p.custom_price && <p className="text-sm text-slate-500">Custom Price: UGX {Number(p.custom_price).toLocaleString()}</p>}
                    <p className="text-sm text-green-700">Commission: {p.commission_rate}%</p>
                  </div>
                  <Badge className={p.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {p.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "performance" && (
        <div className="space-y-4">
          {performance.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-slate-500">No performance data yet. Metrics will appear as sales are generated.</CardContent></Card>
          ) : performance.map((p) => (
            <Card key={p.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{p.affiliate_name}</p>
                    <p className="text-sm text-slate-600">Period: {p.period}</p>
                    <div className="flex gap-4 mt-1">
                      <span className="text-sm text-slate-500">Orders: {p.orders_generated}</span>
                      <span className="text-sm text-blue-700">Rate: {p.conversion_rate}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-700">UGX {Number(p.commission_earned).toLocaleString()}</p>
                    <p className="text-xs text-slate-500">Commission earned</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
