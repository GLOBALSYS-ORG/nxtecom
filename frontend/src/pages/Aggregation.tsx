import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { aggregationAPI } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { isAuthenticated } from "../store/auth";
import { Warehouse, Package, ClipboardCheck, ArrowLeft } from "lucide-react";

interface Center {
  id: string;
  name: string;
  manager_name: string;
  center_type: string;
  location: string;
  capacity_kg: string;
  current_stock_kg: string;
  is_active: boolean;
}
interface Batch {
  id: string;
  batch_number: string;
  center_name: string;
  crop_name: string;
  total_quantity_kg: string;
  quality_grade: string;
  status: string;
  intake_count: number;
  created_at: string;
}
interface Intake {
  id: string;
  farmer_name: string;
  center_name: string;
  crop_name: string;
  quantity_kg: string;
  unit_price: string;
  total_amount: string;
  received_at: string;
}

type Tab = "centers" | "batches" | "intakes";

export default function Aggregation() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("centers");
  const [centers, setCenters] = useState<Center[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { navigate("/login"); return; }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [cRes, bRes, iRes] = await Promise.all([
        aggregationAPI.centers().catch(() => ({ data: [] })),
        aggregationAPI.batches().catch(() => ({ data: [] })),
        aggregationAPI.intakes().catch(() => ({ data: [] })),
      ]);
      const arr = (d: unknown) => {
        const data = d as Record<string, unknown>;
        return Array.isArray(data) ? data : (data.results as unknown[]) || [];
      };
      setCenters(arr(cRes.data) as Center[]);
      setBatches(arr(bRes.data) as Batch[]);
      setIntakes(arr(iRes.data) as Intake[]);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const statusColor = (s: string) => {
    const m: Record<string, string> = {
      created: "bg-blue-100 text-blue-800",
      collecting: "bg-yellow-100 text-yellow-800",
      complete: "bg-green-100 text-green-800",
      processing: "bg-purple-100 text-purple-800",
      shipped: "bg-indigo-100 text-indigo-800",
    };
    return m[s] || "bg-slate-100 text-slate-800";
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-12 text-center">
      <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto" />
      <p className="text-slate-600 mt-4">Loading aggregation data...</p>
    </div>
  );

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "centers", label: "Centers", count: centers.length },
    { key: "batches", label: "Batches", count: batches.length },
    { key: "intakes", label: "Intake Records", count: intakes.length },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Aggregation</h1>
          <p className="text-slate-600">Collection centers, batches, and farmer intakes</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card><CardContent className="pt-6 text-center">
          <Warehouse className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{centers.length}</p>
          <p className="text-sm text-slate-500">Centers</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{batches.length}</p>
          <p className="text-sm text-slate-500">Batches</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <ClipboardCheck className="h-8 w-8 text-amber-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{intakes.length}</p>
          <p className="text-sm text-slate-500">Intake Records</p>
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

      {tab === "centers" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {centers.length === 0 ? (
            <Card className="col-span-2"><CardContent className="py-8 text-center text-slate-500">No aggregation centers found.</CardContent></Card>
          ) : centers.map((c) => (
            <Card key={c.id}>
              <CardHeader className="pb-2"><CardTitle className="text-lg">{c.name}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p className="text-slate-600">Manager: {c.manager_name}</p>
                  <p className="text-slate-600">Location: {c.location}</p>
                  <p className="text-slate-600">Type: <span className="capitalize">{c.center_type.replace(/_/g, " ")}</span></p>
                  <div className="flex justify-between mt-2">
                    <span className="text-slate-500">Stock: {Number(c.current_stock_kg).toLocaleString()} kg</span>
                    <span className="text-slate-500">Capacity: {Number(c.capacity_kg).toLocaleString()} kg</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${Math.min((Number(c.current_stock_kg) / Number(c.capacity_kg)) * 100, 100)}%` }} />
                  </div>
                </div>
                <Badge className={c.is_active ? "bg-green-100 text-green-800 mt-2" : "bg-red-100 text-red-800 mt-2"}>
                  {c.is_active ? "Active" : "Inactive"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "batches" && (
        <div className="space-y-4">
          {batches.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-slate-500">No batches found.</CardContent></Card>
          ) : batches.map((b) => (
            <Card key={b.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium font-mono">{b.batch_number}</p>
                    <p className="text-sm text-slate-600">Center: {b.center_name} | Crop: {b.crop_name}</p>
                    <p className="text-sm text-slate-500">{Number(b.total_quantity_kg).toLocaleString()} kg | {b.intake_count} intakes</p>
                    {b.quality_grade && <p className="text-sm text-slate-500">Grade: {b.quality_grade}</p>}
                  </div>
                  <Badge className={statusColor(b.status)}>{b.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "intakes" && (
        <div className="space-y-4">
          {intakes.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-slate-500">No intake records found.</CardContent></Card>
          ) : intakes.map((i) => (
            <Card key={i.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Farmer: {i.farmer_name}</p>
                    <p className="text-sm text-slate-600">Center: {i.center_name} | Crop: {i.crop_name}</p>
                    <p className="text-sm text-slate-500">{Number(i.quantity_kg).toLocaleString()} kg @ UGX {Number(i.unit_price).toLocaleString()}/kg</p>
                  </div>
                  <p className="text-lg font-semibold text-green-700">UGX {Number(i.total_amount).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
