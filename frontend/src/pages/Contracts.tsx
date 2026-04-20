import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { contractsAPI } from "../lib/api";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { isAuthenticated, getUser } from "../store/auth";
import { FileText, TrendingUp, ArrowLeft } from "lucide-react";

interface Contract {
  id: string;
  contract_number: string;
  farmer_name: string;
  buyer_name: string;
  crop_name: string;
  committed_quantity_kg: string;
  delivered_quantity_kg: string;
  price_per_kg: string;
  total_value: string;
  fulfillment_pct: string;
  status: string;
  start_date: string;
  end_date: string;
  delivery_frequency: string;
}
interface PlantingInfo {
  crop: string;
  field: string;
  area_acres: string;
}
interface Forecast {
  id: string;
  planting_info: PlantingInfo | null;
  estimated_yield_kg: string;
  forecast_date: string;
  confidence: string;
  notes: string;
}

type Tab = "contracts" | "forecasts";

export default function Contracts() {
  const navigate = useNavigate();
  const user = getUser();
  const [tab, setTab] = useState<Tab>("contracts");
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { navigate("/login"); return; }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [cRes, fRes] = await Promise.all([
        contractsAPI.list().catch(() => ({ data: [] })),
        contractsAPI.harvestForecasts().catch(() => ({ data: [] })),
      ]);
      const arr = (d: unknown) => {
        const data = d as Record<string, unknown>;
        return Array.isArray(data) ? data : (data.results as unknown[]) || [];
      };
      setContracts(arr(cRes.data) as Contract[]);
      setForecasts(arr(fRes.data) as Forecast[]);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const statusColor = (s: string) => {
    const m: Record<string, string> = {
      draft: "bg-slate-100 text-slate-800",
      active: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
      expired: "bg-yellow-100 text-yellow-800",
    };
    return m[s] || "bg-slate-100 text-slate-800";
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-12 text-center">
      <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto" />
      <p className="text-slate-600 mt-4">Loading contracts data...</p>
    </div>
  );

  const totalValue = contracts.reduce((s, c) => s + Number(c.total_value || 0), 0);
  const activeContracts = contracts.filter(c => c.status === "active").length;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "contracts", label: "Supply Contracts", count: contracts.length },
    { key: "forecasts", label: "Harvest Forecasts", count: forecasts.length },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(user?.role === "farmer" ? "/farmer-dashboard" : "/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contracts & Forecasts</h1>
          <p className="text-slate-600">Supply contracts and harvest forecasting</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card><CardContent className="pt-6 text-center">
          <FileText className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{contracts.length}</p>
          <p className="text-sm text-slate-500">Total Contracts</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{activeContracts}</p>
          <p className="text-sm text-slate-500">Active</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">UGX {totalValue.toLocaleString()}</p>
          <p className="text-sm text-slate-500">Total Value</p>
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

      {tab === "contracts" && (
        <div className="space-y-4">
          {contracts.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-slate-500">No supply contracts found. Contracts will appear when established between farmers and buyers.</CardContent></Card>
          ) : contracts.map((c) => (
            <Card key={c.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium font-mono">{c.contract_number}</p>
                    <p className="text-sm text-slate-600">Farmer: {c.farmer_name} | Buyer: {c.buyer_name}</p>
                    <p className="text-sm text-slate-500">Crop: {c.crop_name} | {Number(c.committed_quantity_kg).toLocaleString()} kg @ UGX {Number(c.price_per_kg).toLocaleString()}/kg</p>
                    <p className="text-sm text-slate-500">
                      Period: {new Date(c.start_date).toLocaleDateString()} - {new Date(c.end_date).toLocaleDateString()}
                      {c.delivery_frequency && <span> | Frequency: <span className="capitalize">{c.delivery_frequency}</span></span>}
                    </p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Delivered: {Number(c.delivered_quantity_kg).toLocaleString()} kg</span>
                        <span>{c.fulfillment_pct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${Math.min(Number(c.fulfillment_pct), 100)}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={statusColor(c.status)}>{c.status}</Badge>
                    <p className="text-lg font-semibold text-green-700 mt-2">UGX {Number(c.total_value).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "forecasts" && (
        <div className="space-y-4">
          {forecasts.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-slate-500">No harvest forecasts yet. Create forecasts to plan your supply chain.</CardContent></Card>
          ) : forecasts.map((f) => (
            <Card key={f.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{f.planting_info ? f.planting_info.crop : "Unknown Crop"}</p>
                    {f.planting_info && <p className="text-sm text-slate-600">{f.planting_info.field} - {f.planting_info.area_acres} acres</p>}
                    <p className="text-sm text-slate-500">Forecast date: {new Date(f.forecast_date).toLocaleDateString()}</p>
                    {f.notes && <p className="text-sm text-slate-400 mt-1">{f.notes}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-emerald-700">{Number(f.estimated_yield_kg).toLocaleString()} kg</p>
                    <p className="text-sm text-slate-500">Confidence: {f.confidence}%</p>
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
