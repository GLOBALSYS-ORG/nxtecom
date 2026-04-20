import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { intelligenceAPI } from "../lib/api";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { isAuthenticated } from "../store/auth";
import { Brain, TrendingUp, DollarSign, BarChart3, ArrowLeft } from "lucide-react";

interface Forecast {
  id: string;
  product_name: string;
  region: string;
  period_start: string;
  period_end: string;
  predicted_demand_kg: string;
  confidence: string;
  accuracy_score: string;
  methodology: string;
}
interface Match {
  id: string;
  product_name: string;
  region: string;
  supply_available_kg: string;
  demand_forecast_kg: string;
  gap_kg: string;
  recommended_action: string;
  computed_at: string;
}
interface PricingRule {
  id: string;
  product_name: string;
  category_name: string;
  rule_type: string;
  name: string;
  price_modifier: string;
  is_active: boolean;
}
interface Snapshot {
  id: string;
  snapshot_type: string;
  data: Record<string, unknown>;
  insights: string[];
  period_start: string;
  period_end: string;
  created_at: string;
}

type Tab = "forecasts" | "matching" | "pricing" | "analytics";

export default function Intelligence() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("forecasts");
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [analytics, setAnalytics] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { navigate("/login"); return; }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [fRes, mRes, pRes, aRes] = await Promise.all([
        intelligenceAPI.demandForecasts().catch(() => ({ data: [] })),
        intelligenceAPI.supplyDemand().catch(() => ({ data: [] })),
        intelligenceAPI.pricingRules().catch(() => ({ data: [] })),
        intelligenceAPI.analytics().catch(() => ({ data: [] })),
      ]);
      const arr = (d: unknown) => {
        const data = d as Record<string, unknown>;
        return Array.isArray(data) ? data : (data.results as unknown[]) || [];
      };
      setForecasts(arr(fRes.data) as Forecast[]);
      setMatches(arr(mRes.data) as Match[]);
      setPricingRules(arr(pRes.data) as PricingRule[]);
      setAnalytics(arr(aRes.data) as Snapshot[]);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-12 text-center">
      <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto" />
      <p className="text-slate-600 mt-4">Loading intelligence data...</p>
    </div>
  );

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "forecasts", label: "Demand Forecasts", count: forecasts.length },
    { key: "matching", label: "Supply-Demand", count: matches.length },
    { key: "pricing", label: "Pricing Rules", count: pricingRules.length },
    { key: "analytics", label: "Analytics", count: analytics.length },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Market Intelligence</h1>
          <p className="text-slate-600">Demand forecasting, supply-demand matching, and dynamic pricing</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="pt-6 text-center">
          <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{forecasts.length}</p>
          <p className="text-sm text-slate-500">Forecasts</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{matches.length}</p>
          <p className="text-sm text-slate-500">Supply-Demand Matches</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <DollarSign className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{pricingRules.length}</p>
          <p className="text-sm text-slate-500">Pricing Rules</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <BarChart3 className="h-8 w-8 text-amber-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{analytics.length}</p>
          <p className="text-sm text-slate-500">Analytics Snapshots</p>
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

      {tab === "forecasts" && (
        <div className="space-y-4">
          {forecasts.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-slate-500">No demand forecasts available. Data will populate as the system collects order history.</CardContent></Card>
          ) : forecasts.map((f) => (
            <Card key={f.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{f.product_name}</p>
                    <p className="text-sm text-slate-600">Region: {f.region}</p>
                    <p className="text-sm text-slate-500">Period: {new Date(f.period_start).toLocaleDateString()} - {new Date(f.period_end).toLocaleDateString()}</p>
                    <p className="text-sm text-slate-500">Method: {f.methodology}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-emerald-700">{Number(f.predicted_demand_kg).toLocaleString()} kg</p>
                    <p className="text-sm text-slate-500">Confidence: {f.confidence}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "matching" && (
        <div className="space-y-4">
          {matches.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-slate-500">No supply-demand matches yet. The system will compute matches as data flows in.</CardContent></Card>
          ) : matches.map((m) => (
            <Card key={m.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{m.product_name}</p>
                    <p className="text-sm text-slate-600">Region: {m.region}</p>
                    <div className="flex gap-4 mt-1">
                      <span className="text-sm text-green-700">Supply: {Number(m.supply_available_kg).toLocaleString()} kg</span>
                      <span className="text-sm text-blue-700">Demand: {Number(m.demand_forecast_kg).toLocaleString()} kg</span>
                    </div>
                    {m.recommended_action && <p className="text-sm font-medium text-purple-700 mt-1">{m.recommended_action}</p>}
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${Number(m.gap_kg) > 0 ? "text-green-700" : "text-red-700"}`}>
                      {Number(m.gap_kg) > 0 ? "+" : ""}{Number(m.gap_kg).toLocaleString()} kg
                    </p>
                    <p className="text-xs text-slate-500">Gap</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "pricing" && (
        <div className="space-y-4">
          {pricingRules.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-slate-500">No pricing rules configured. Create rules to enable dynamic pricing.</CardContent></Card>
          ) : pricingRules.map((p) => (
            <Card key={p.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{p.name || p.product_name || p.category_name || "General Rule"}</p>
                    <p className="text-sm text-slate-600 capitalize">Type: {p.rule_type.replace(/_/g, " ")}</p>
                    <p className="text-sm text-slate-500">Modifier: {Number(p.price_modifier).toFixed(2)}x</p>
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

      {tab === "analytics" && (
        <div className="space-y-4">
          {analytics.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-slate-500">No analytics snapshots yet. Data will populate as the system processes transactions.</CardContent></Card>
          ) : analytics.map((a) => (
            <Card key={a.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium capitalize">{a.snapshot_type.replace(/_/g, " ")}</p>
                    <p className="text-sm text-slate-500">Period: {new Date(a.period_start).toLocaleDateString()} - {new Date(a.period_end).toLocaleDateString()}</p>
                  </div>
                  <p className="text-sm text-slate-500">{new Date(a.created_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
