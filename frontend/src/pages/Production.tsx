import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productionAPI } from "../lib/api";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { isAuthenticated, getUser } from "../store/auth";
import { Sprout, Bug, Package, ArrowLeft } from "lucide-react";

interface Crop {
  id: string;
  name: string;
  category: string;
  growing_season: string;
  avg_yield_per_acre: string;
}
interface PlantingRecord {
  id: string;
  crop_name: string;
  field_name: string;
  area_acres: string;
  planting_date: string;
  expected_harvest_date: string;
  status: string;
  notes: string;
}
interface HarvestRecord {
  id: string;
  crop_name: string;
  harvest_date: string;
  yield_kg: string;
  quality_grade: string;
  storage_location: string;
  notes: string;
}
interface LivestockRecord {
  id: string;
  animal_type: string;
  animal_type_display: string;
  breed: string;
  count: number;
  health_status: string;
  location: string;
  notes: string;
}

type Tab = "planting" | "harvests" | "livestock" | "crops";

export default function Production() {
  const navigate = useNavigate();
  const user = getUser();
  const [tab, setTab] = useState<Tab>("planting");
  const [crops, setCrops] = useState<Crop[]>([]);
  const [planting, setPlanting] = useState<PlantingRecord[]>([]);
  const [harvests, setHarvests] = useState<HarvestRecord[]>([]);
  const [livestock, setLivestock] = useState<LivestockRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [cRes, pRes, hRes, lRes] = await Promise.all([
        productionAPI.crops().catch(() => ({ data: [] })),
        productionAPI.planting().catch(() => ({ data: [] })),
        productionAPI.harvests().catch(() => ({ data: [] })),
        productionAPI.livestock().catch(() => ({ data: [] })),
      ]);
      const arr = (d: unknown) => {
        const data = d as Record<string, unknown>;
        return Array.isArray(data) ? data : (data.results as unknown[]) || [];
      };
      setCrops(arr(cRes.data) as Crop[]);
      setPlanting(arr(pRes.data) as PlantingRecord[]);
      setHarvests(arr(hRes.data) as HarvestRecord[]);
      setLivestock(arr(lRes.data) as LivestockRecord[]);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (s: string) => {
    const m: Record<string, string> = {
      growing: "bg-green-100 text-green-800",
      planted: "bg-blue-100 text-blue-800",
      harvested: "bg-amber-100 text-amber-800",
      failed: "bg-red-100 text-red-800",
      ready_to_harvest: "bg-yellow-100 text-yellow-800",
      healthy: "bg-green-100 text-green-800",
      sick: "bg-red-100 text-red-800",
      recovering: "bg-yellow-100 text-yellow-800",
    };
    return m[s] || "bg-slate-100 text-slate-800";
  };

  if (loading)
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto" />
        <p className="text-slate-600 mt-4">Loading production data...</p>
      </div>
    );

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "planting", label: "Planting", count: planting.length },
    { key: "harvests", label: "Harvests", count: harvests.length },
    { key: "livestock", label: "Livestock", count: livestock.length },
    { key: "crops", label: "Crop Catalog", count: crops.length },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            navigate(
              user?.role === "farmer" ? "/farmer-dashboard" : "/dashboard"
            )
          }
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Production Management
          </h1>
          <p className="text-slate-600">
            Track crops, harvests, and livestock
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
              tab === t.key
                ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.label}{" "}
            <Badge variant="secondary" className="ml-1">
              {t.count}
            </Badge>
          </button>
        ))}
      </div>

      {tab === "planting" && (
        <div className="space-y-4">
          {planting.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-slate-500">
                No planting records found.
              </CardContent>
            </Card>
          ) : (
            planting.map((p) => (
              <Card key={p.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <Sprout className="h-5 w-5 text-green-600 mt-1" />
                      <div>
                        <p className="font-medium">{p.crop_name}</p>
                        <p className="text-sm text-slate-500">
                          {p.field_name} - {p.area_acres} acres
                        </p>
                        <p className="text-sm text-slate-400">
                          Planted:{" "}
                          {new Date(p.planting_date).toLocaleDateString()} |
                          Expected harvest:{" "}
                          {new Date(
                            p.expected_harvest_date
                          ).toLocaleDateString()}
                        </p>
                        {p.notes && (
                          <p className="text-sm text-slate-400 mt-1">
                            {p.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className={statusColor(p.status)}>
                      {p.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "harvests" && (
        <div className="space-y-4">
          {harvests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-slate-500">
                No harvest records found.
              </CardContent>
            </Card>
          ) : (
            harvests.map((h) => (
              <Card key={h.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-amber-600 mt-1" />
                      <div>
                        <p className="font-medium">{h.crop_name}</p>
                        <p className="text-sm text-slate-500">
                          Harvested:{" "}
                          {new Date(h.harvest_date).toLocaleDateString()} |
                          Stored: {h.storage_location}
                        </p>
                        <p className="text-sm font-medium text-green-700">
                          {Number(h.yield_kg).toLocaleString()} kg harvested
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {h.quality_grade.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "livestock" && (
        <div className="space-y-4">
          {livestock.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-slate-500">
                No livestock records found.
              </CardContent>
            </Card>
          ) : (
            livestock.map((l) => (
              <Card key={l.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <Bug className="h-5 w-5 text-amber-600 mt-1" />
                      <div>
                        <p className="font-medium">
                          {l.animal_type_display || l.animal_type}
                        </p>
                        <p className="text-sm text-slate-500">
                          Breed: {l.breed} | Location: {l.location}
                        </p>
                        <p className="text-sm font-medium">{l.count} head</p>
                      </div>
                    </div>
                    <Badge className={statusColor(l.health_status)}>
                      {l.health_status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "crops" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {crops.map((c) => (
            <Card key={c.id}>
              <CardContent className="pt-6">
                <h3 className="font-medium">{c.name}</h3>
                <p className="text-sm text-slate-500 capitalize">
                  {c.category.replace(/_/g, " ")}
                </p>
                <p className="text-sm text-slate-400">
                  Season: {c.growing_season}
                </p>
                <p className="text-sm text-slate-400">
                  Avg yield: {Number(c.avg_yield_per_acre).toLocaleString()}{" "}
                  kg/acre
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
