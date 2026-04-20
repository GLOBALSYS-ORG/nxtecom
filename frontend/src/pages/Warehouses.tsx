import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { warehouseAPI } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { isAuthenticated } from "../store/auth";
import { Warehouse as WarehouseIcon, Package, Calendar, ArrowLeft } from "lucide-react";

interface WarehouseItem {
  id: string;
  name: string;
  owner_name: string;
  location: string;
  region: string;
  storage_type: string;
  storage_type_display: string;
  capacity_kg: string;
  current_stock_kg: string;
  utilization_pct: string;
  is_active: boolean;
}
interface StockItem {
  id: string;
  warehouse_name: string;
  product_name: string;
  quantity_kg: string;
  quantity_units: number;
  location_in_warehouse: string;
  received_at: string;
}
interface Schedule {
  id: string;
  shipment_number: string;
  pickup_time: string;
  delivery_time: string;
  route: string;
  priority: string;
}

type Tab = "warehouses" | "stock" | "schedules";

export default function Warehouses() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("warehouses");
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { navigate("/login"); return; }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [wRes, sRes, dRes] = await Promise.all([
        warehouseAPI.list().catch(() => ({ data: [] })),
        warehouseAPI.stock().catch(() => ({ data: [] })),
        warehouseAPI.deliverySchedules().catch(() => ({ data: [] })),
      ]);
      const arr = (d: unknown) => {
        const data = d as Record<string, unknown>;
        return Array.isArray(data) ? data : (data.results as unknown[]) || [];
      };
      setWarehouses(arr(wRes.data) as WarehouseItem[]);
      setStock(arr(sRes.data) as StockItem[]);
      setSchedules(arr(dRes.data) as Schedule[]);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const priorityColor = (p: string) => {
    const m: Record<string, string> = {
      low: "bg-slate-100 text-slate-800",
      normal: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return m[p] || "bg-slate-100 text-slate-800";
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-12 text-center">
      <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto" />
      <p className="text-slate-600 mt-4">Loading warehouse data...</p>
    </div>
  );

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "warehouses", label: "Warehouses", count: warehouses.length },
    { key: "stock", label: "Stock Items", count: stock.length },
    { key: "schedules", label: "Delivery Schedules", count: schedules.length },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Warehouses</h1>
          <p className="text-slate-600">Storage facilities, stock, and delivery schedules</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card><CardContent className="pt-6 text-center">
          <WarehouseIcon className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{warehouses.length}</p>
          <p className="text-sm text-slate-500">Warehouses</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{stock.length}</p>
          <p className="text-sm text-slate-500">Stock Items</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <Calendar className="h-8 w-8 text-amber-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{schedules.length}</p>
          <p className="text-sm text-slate-500">Scheduled Deliveries</p>
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

      {tab === "warehouses" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {warehouses.length === 0 ? (
            <Card className="col-span-2"><CardContent className="py-8 text-center text-slate-500">No warehouses found.</CardContent></Card>
          ) : warehouses.map((w) => (
            <Card key={w.id}>
              <CardHeader className="pb-2"><CardTitle className="text-lg">{w.name}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p className="text-slate-600">Owner: {w.owner_name}</p>
                  <p className="text-slate-600">Location: {w.location}{w.region ? ` (${w.region})` : ""}</p>
                  <p className="text-slate-600">Type: {w.storage_type_display}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-slate-500">Stock: {Number(w.current_stock_kg).toLocaleString()} kg</span>
                    <span className="text-slate-500">Capacity: {Number(w.capacity_kg).toLocaleString()} kg</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                    <div className={`h-2 rounded-full ${Number(w.utilization_pct) > 80 ? "bg-red-500" : "bg-emerald-600"}`}
                      style={{ width: `${Math.min(Number(w.utilization_pct), 100)}%` }} />
                  </div>
                  <p className="text-xs text-slate-400 text-right">{w.utilization_pct}% utilized</p>
                </div>
                <Badge className={w.is_active ? "bg-green-100 text-green-800 mt-2" : "bg-red-100 text-red-800 mt-2"}>
                  {w.is_active ? "Active" : "Inactive"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "stock" && (
        <div className="space-y-4">
          {stock.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-slate-500">No stock items found.</CardContent></Card>
          ) : stock.map((s) => (
            <Card key={s.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{s.product_name}</p>
                    <p className="text-sm text-slate-600">Warehouse: {s.warehouse_name}</p>
                    {s.location_in_warehouse && <p className="text-sm text-slate-500">Location: {s.location_in_warehouse}</p>}
                    <p className="text-sm text-slate-400">Received: {new Date(s.received_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{Number(s.quantity_kg).toLocaleString()} kg</p>
                    <p className="text-sm text-slate-500">{s.quantity_units} units</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "schedules" && (
        <div className="space-y-4">
          {schedules.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-slate-500">No delivery schedules found.</CardContent></Card>
          ) : schedules.map((s) => (
            <Card key={s.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium font-mono">{s.shipment_number}</p>
                    <p className="text-sm text-slate-600">Pickup: {new Date(s.pickup_time).toLocaleString()}</p>
                    <p className="text-sm text-slate-600">Delivery: {new Date(s.delivery_time).toLocaleString()}</p>
                    {s.route && <p className="text-sm text-slate-500">Route: {s.route}</p>}
                  </div>
                  <Badge className={priorityColor(s.priority)}>{s.priority}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
