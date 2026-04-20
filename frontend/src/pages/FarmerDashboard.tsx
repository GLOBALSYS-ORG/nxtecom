import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productionAPI, inventoryAPI } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { isAuthenticated, getUser } from "../store/auth";
import { Sprout, Bug, Warehouse, DollarSign, TrendingUp, Leaf, FileText, Package, ClipboardCheck } from "lucide-react";

interface PlantingRecord { id: string; crop_name: string; field_name: string; area_acres: string; planting_date: string; expected_harvest_date: string; status: string; }
interface LivestockRecord { id: string; animal_type: string; animal_type_display: string; breed: string; count: number; health_status: string; location: string; }
interface PurchaseOffer { id: string; buyer_name: string; crop_name: string; product_description: string; quantity_kg: string; price_per_kg: string; total_amount: string; delivery_date: string; status: string; }
interface HarvestRecord { id: string; crop_name: string; harvest_date: string; yield_kg: string; quality_grade: string; storage_location: string; }

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const [planting, setPlanting] = useState<PlantingRecord[]>([]);
  const [livestock, setLivestock] = useState<LivestockRecord[]>([]);
  const [offers, setOffers] = useState<PurchaseOffer[]>([]);
  const [harvests, setHarvests] = useState<HarvestRecord[]>([]);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { navigate("/login"); return; }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [pRes, lRes, oRes, hRes, iRes] = await Promise.all([
        productionAPI.planting().catch(() => ({ data: [] })),
        productionAPI.livestock().catch(() => ({ data: [] })),
        productionAPI.purchaseOffers().catch(() => ({ data: [] })),
        productionAPI.harvests().catch(() => ({ data: [] })),
        inventoryAPI.list().catch(() => ({ data: [] })),
      ]);
      const arr = (d: unknown) => { const data = d as Record<string, unknown>; return Array.isArray(data) ? data : (data.results as unknown[]) || []; };
      setPlanting(arr(pRes.data)); setLivestock(arr(lRes.data));
      setOffers(arr(oRes.data)); setHarvests(arr(hRes.data));
      setInventoryCount(arr(iRes.data).length);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const handleOfferAction = async (id: string, action: "accept" | "reject") => {
    try {
      if (action === "accept") await productionAPI.acceptOffer(id);
      else await productionAPI.rejectOffer(id);
      loadData();
    } catch { /* ignore */ }
  };

  const statusColor = (s: string) => {
    const m: Record<string, string> = { growing: "bg-green-100 text-green-800", planted: "bg-blue-100 text-blue-800", harvested: "bg-amber-100 text-amber-800", failed: "bg-red-100 text-red-800", ready_to_harvest: "bg-yellow-100 text-yellow-800" };
    return m[s] || "bg-slate-100 text-slate-800";
  };

  const fmt = (n: string | number) => `UGX ${Number(n).toLocaleString()}`;

  if (loading) return (<div className="max-w-6xl mx-auto px-4 py-12 text-center"><div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto" /><p className="text-slate-600 mt-4">Loading farmer dashboard...</p></div>);

  const active = planting.filter(p => p.status === "growing" || p.status === "planted");
  const totalAcres = planting.reduce((s, p) => s + parseFloat(p.area_acres || "0"), 0);
  const totalLivestock = livestock.reduce((s, l) => s + l.count, 0);
  const openOffers = offers.filter(o => o.status === "open");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Farmer Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome, {user?.first_name || user?.username}! <Badge className="bg-green-100 text-green-800">Farmer</Badge></p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Active Crops", value: active.length, icon: Sprout, color: "text-green-600" },
          { label: "Total Acres", value: totalAcres.toFixed(1), icon: Leaf, color: "text-emerald-600" },
          { label: "Livestock", value: totalLivestock, icon: Bug, color: "text-amber-600" },
          { label: "Inventory", value: inventoryCount, icon: Warehouse, color: "text-blue-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-600">{label}</p><p className="text-2xl font-bold">{value}</p></div><Icon className={`h-8 w-8 ${color}`} /></div></CardContent></Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Sprout className="h-5 w-5 text-green-600" /> Planting Records</CardTitle></CardHeader>
          <CardContent>
            {planting.length === 0 ? <p className="text-slate-500 text-sm">No planting records.</p> : (
              <div className="space-y-3">{planting.map(p => (
                <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div><p className="font-medium text-sm">{p.crop_name}</p><p className="text-xs text-slate-500">{p.field_name} - {p.area_acres} acres</p><p className="text-xs text-slate-400">Planted: {new Date(p.planting_date).toLocaleDateString()}</p></div>
                  <Badge className={statusColor(p.status)}>{p.status.replace(/_/g, " ")}</Badge>
                </div>
              ))}</div>
            )}
            <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => navigate("/production")}>Manage Production</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Bug className="h-5 w-5 text-amber-600" /> Livestock</CardTitle></CardHeader>
          <CardContent>
            {livestock.length === 0 ? <p className="text-slate-500 text-sm">No livestock records.</p> : (
              <div className="space-y-3">{livestock.map(l => (
                <div key={l.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div><p className="font-medium text-sm">{l.animal_type_display || l.animal_type}</p><p className="text-xs text-slate-500">{l.breed} - {l.location}</p></div>
                  <div className="text-right"><p className="font-bold text-sm">{l.count} head</p><Badge className={l.health_status === "healthy" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>{l.health_status}</Badge></div>
                </div>
              ))}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-amber-600" /> Harvest Records</CardTitle></CardHeader>
          <CardContent>
            {harvests.length === 0 ? <p className="text-slate-500 text-sm">No harvests yet.</p> : (
              <div className="space-y-3">{harvests.map(h => (
                <div key={h.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div><p className="font-medium text-sm">{h.crop_name}</p><p className="text-xs text-slate-500">{new Date(h.harvest_date).toLocaleDateString()} - {h.storage_location}</p></div>
                  <div className="text-right"><p className="font-bold text-sm">{Number(h.yield_kg).toLocaleString()} kg</p><Badge className="bg-blue-100 text-blue-800">{h.quality_grade.replace(/_/g, " ")}</Badge></div>
                </div>
              ))}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-green-600" /> Purchase Offers ({openOffers.length} open)</CardTitle></CardHeader>
          <CardContent>
            {offers.length === 0 ? <p className="text-slate-500 text-sm">No offers yet.</p> : (
              <div className="space-y-3">{offers.map(o => (
                <div key={o.id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div><p className="font-medium text-sm">{o.product_description}</p><p className="text-xs text-slate-500">From: {o.buyer_name} | {Number(o.quantity_kg).toLocaleString()} kg @ {fmt(o.price_per_kg)}/kg</p></div>
                    <div className="text-right"><p className="font-bold text-sm">{fmt(o.total_amount)}</p><Badge className={o.status === "open" ? "bg-blue-100 text-blue-800" : o.status === "accepted" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"}>{o.status}</Badge></div>
                  </div>
                  {o.status === "open" && (<div className="flex gap-2 mt-2"><Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleOfferAction(o.id, "accept")}>Accept</Button><Button size="sm" variant="outline" className="flex-1 text-red-600" onClick={() => handleOfferAction(o.id, "reject")}>Reject</Button></div>)}
                </div>
              ))}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Production", icon: Sprout, path: "/production", color: "text-green-600" },
              { label: "Contracts", icon: ClipboardCheck, path: "/contracts", color: "text-amber-600" },
              { label: "Inventory", icon: Warehouse, path: "/inventory", color: "text-blue-600" },
              { label: "Finances", icon: FileText, path: "/financial-statements", color: "text-indigo-600" },
              { label: "Market Prices", icon: TrendingUp, path: "/products", color: "text-purple-600" },
            ].map(({ label, icon: Icon, path, color }) => (
              <Button key={label} variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => navigate(path)}><Icon className={`h-6 w-6 ${color}`} /><span className="text-xs">{label}</span></Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
