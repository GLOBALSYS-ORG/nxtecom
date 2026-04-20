import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { processingAPI } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { isAuthenticated } from "../store/auth";
import { Factory, Cog, DollarSign, BarChart3, ArrowLeft } from "lucide-react";

interface Facility {
  id: string;
  name: string;
  owner_name: string;
  facility_type: string;
  location: string;
  capacity_kg_per_day: string;
  is_active: boolean;
}
interface Job {
  id: string;
  job_number: string;
  facility_name: string;
  batch_number: string;
  output_product_name: string;
  input_quantity_kg: string;
  output_quantity_kg: string;
  yield_pct: string;
  status: string;
  total_cost: number;
  started_at: string;
}
interface Cost {
  id: string;
  cost_type: string;
  description: string;
  amount: string;
  created_at: string;
}
interface YieldRec {
  id: string;
  job_number: string;
  input_kg: string;
  output_kg: string;
  yield_percentage: string;
  waste_kg: string;
  recorded_at: string;
}

type Tab = "facilities" | "jobs" | "costs" | "yields";

export default function ProcessingPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("facilities");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [costs, setCosts] = useState<Cost[]>([]);
  const [yields, setYields] = useState<YieldRec[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { navigate("/login"); return; }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [fRes, jRes, cRes, yRes] = await Promise.all([
        processingAPI.facilities().catch(() => ({ data: [] })),
        processingAPI.jobs().catch(() => ({ data: [] })),
        processingAPI.costs().catch(() => ({ data: [] })),
        processingAPI.yields().catch(() => ({ data: [] })),
      ]);
      const arr = (d: unknown) => {
        const data = d as Record<string, unknown>;
        return Array.isArray(data) ? data : (data.results as unknown[]) || [];
      };
      setFacilities(arr(fRes.data) as Facility[]);
      setJobs(arr(jRes.data) as Job[]);
      setCosts(arr(cRes.data) as Cost[]);
      setYields(arr(yRes.data) as YieldRec[]);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const statusColor = (s: string) => {
    const m: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };
    return m[s] || "bg-slate-100 text-slate-800";
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-12 text-center">
      <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto" />
      <p className="text-slate-600 mt-4">Loading processing data...</p>
    </div>
  );

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "facilities", label: "Facilities", count: facilities.length },
    { key: "jobs", label: "Jobs", count: jobs.length },
    { key: "costs", label: "Costs", count: costs.length },
    { key: "yields", label: "Yield Records", count: yields.length },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Processing</h1>
          <p className="text-slate-600">Facilities, jobs, costs, and yield tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="pt-6 text-center">
          <Factory className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{facilities.length}</p>
          <p className="text-sm text-slate-500">Facilities</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <Cog className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{jobs.length}</p>
          <p className="text-sm text-slate-500">Jobs</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <DollarSign className="h-8 w-8 text-red-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{costs.length}</p>
          <p className="text-sm text-slate-500">Cost Records</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <BarChart3 className="h-8 w-8 text-amber-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{yields.length}</p>
          <p className="text-sm text-slate-500">Yield Records</p>
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

      {tab === "facilities" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {facilities.length === 0 ? (
            <Card className="col-span-2"><CardContent className="py-8 text-center text-slate-500">No processing facilities found.</CardContent></Card>
          ) : facilities.map((f) => (
            <Card key={f.id}>
              <CardHeader className="pb-2"><CardTitle className="text-lg">{f.name}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p className="text-slate-600">Owner: {f.owner_name}</p>
                  <p className="text-slate-600">Location: {f.location}</p>
                  <p className="text-slate-600">Type: <span className="capitalize">{f.facility_type.replace(/_/g, " ")}</span></p>
                  <p className="text-slate-600">Capacity: {Number(f.capacity_kg_per_day).toLocaleString()} kg/day</p>
                </div>
                <Badge className={f.is_active ? "bg-green-100 text-green-800 mt-2" : "bg-red-100 text-red-800 mt-2"}>
                  {f.is_active ? "Active" : "Inactive"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "jobs" && (
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-slate-500">No processing jobs found.</CardContent></Card>
          ) : jobs.map((j) => (
            <Card key={j.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium font-mono">{j.job_number}</p>
                    <p className="text-sm text-slate-600">Facility: {j.facility_name} | Batch: {j.batch_number}</p>
                    <p className="text-sm text-slate-500">Input: {Number(j.input_quantity_kg).toLocaleString()} kg | Output: {Number(j.output_quantity_kg).toLocaleString()} kg</p>
                    {j.output_product_name && <p className="text-sm text-slate-500">Product: {j.output_product_name}</p>}
                    <p className="text-sm text-green-700">Yield: {j.yield_pct}% | Cost: UGX {j.total_cost.toLocaleString()}</p>
                  </div>
                  <Badge className={statusColor(j.status)}>{j.status.replace(/_/g, " ")}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "costs" && (
        <div className="space-y-4">
          {costs.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-slate-500">No cost records found.</CardContent></Card>
          ) : costs.map((c) => (
            <Card key={c.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium capitalize">{c.cost_type.replace(/_/g, " ")}</p>
                    <p className="text-sm text-slate-500">{c.description}</p>
                  </div>
                  <p className="text-lg font-semibold text-red-700">UGX {Number(c.amount).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "yields" && (
        <div className="space-y-4">
          {yields.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-slate-500">No yield records found.</CardContent></Card>
          ) : yields.map((y) => (
            <Card key={y.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium font-mono">{y.job_number}</p>
                    <p className="text-sm text-slate-500">Input: {Number(y.input_kg).toLocaleString()} kg | Output: {Number(y.output_kg).toLocaleString()} kg</p>
                    <p className="text-sm text-slate-500">Waste: {Number(y.waste_kg).toLocaleString()} kg</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-700">{y.yield_percentage}%</p>
                    <p className="text-xs text-slate-500">Yield</p>
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
