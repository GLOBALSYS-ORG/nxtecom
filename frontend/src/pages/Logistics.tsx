import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logisticsAPI } from "../lib/api";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { isAuthenticated } from "../store/auth";
import { Truck, MapPin, Package, ArrowLeft, Clock } from "lucide-react";

interface Shipment {
  id: string;
  tracking_number: string;
  sender_name: string;
  receiver_name: string;
  origin: string;
  destination: string;
  status: string;
  estimated_delivery: string;
  created_at: string;
  items_count: number;
}
interface Transporter {
  id: string;
  name: string;
  vehicle_type: string;
  vehicle_number: string;
  phone: string;
  is_available: boolean;
  current_location: string;
}

export default function Logistics() {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"shipments" | "transporters">("shipments");

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [sRes, tRes] = await Promise.all([
        logisticsAPI.shipments().catch(() => ({ data: [] })),
        logisticsAPI.transporters().catch(() => ({ data: [] })),
      ]);
      const arr = (d: unknown) => {
        const data = d as Record<string, unknown>;
        return Array.isArray(data) ? data : (data.results as unknown[]) || [];
      };
      setShipments(arr(sRes.data) as Shipment[]);
      setTransporters(arr(tRes.data) as Transporter[]);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (s: string) => {
    const m: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      picked_up: "bg-blue-100 text-blue-800",
      in_transit: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      returned: "bg-slate-100 text-slate-800",
    };
    return m[s] || "bg-slate-100 text-slate-800";
  };

  if (loading)
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto" />
        <p className="text-slate-600 mt-4">Loading logistics data...</p>
      </div>
    );

  const activeShipments = shipments.filter(
    (s) => s.status !== "delivered" && s.status !== "failed"
  );
  const availableTransporters = transporters.filter((t) => t.is_available);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Logistics & Shipping
          </h1>
          <p className="text-slate-600">
            Track shipments and manage transporters
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            label: "Total Shipments",
            value: shipments.length,
            icon: Package,
            color: "text-blue-600",
          },
          {
            label: "Active Shipments",
            value: activeShipments.length,
            icon: Truck,
            color: "text-indigo-600",
          },
          {
            label: "Transporters",
            value: transporters.length,
            icon: Truck,
            color: "text-amber-600",
          },
          {
            label: "Available",
            value: availableTransporters.length,
            icon: MapPin,
            color: "text-green-600",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{label}</p>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
                <Icon className={`h-8 w-8 ${color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-2">
        <button
          onClick={() => setTab("shipments")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
            tab === "shipments"
              ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Shipments{" "}
          <Badge variant="secondary" className="ml-1">
            {shipments.length}
          </Badge>
        </button>
        <button
          onClick={() => setTab("transporters")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
            tab === "transporters"
              ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Transporters{" "}
          <Badge variant="secondary" className="ml-1">
            {transporters.length}
          </Badge>
        </button>
      </div>

      {tab === "shipments" && (
        <div className="space-y-4">
          {shipments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-slate-500">
                No shipments found. Shipments will appear here when orders are
                dispatched.
              </CardContent>
            </Card>
          ) : (
            shipments.map((s) => (
              <Card key={s.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <Truck className="h-5 w-5 text-blue-600 mt-1" />
                      <div>
                        <p className="font-medium">#{s.tracking_number}</p>
                        <p className="text-sm text-slate-500">
                          {s.sender_name} → {s.receiver_name}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {s.origin} →{" "}
                            {s.destination}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Est:{" "}
                            {s.estimated_delivery
                              ? new Date(
                                  s.estimated_delivery
                                ).toLocaleDateString()
                              : "TBD"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge className={statusColor(s.status)}>
                      {s.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "transporters" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {transporters.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-8 text-center text-slate-500">
                No transporters registered yet.
              </CardContent>
            </Card>
          ) : (
            transporters.map((t) => (
              <Card key={t.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{t.name}</p>
                      <p className="text-sm text-slate-500 capitalize">
                        {t.vehicle_type} - {t.vehicle_number}
                      </p>
                      <p className="text-sm text-slate-400">{t.phone}</p>
                      {t.current_location && (
                        <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" /> {t.current_location}
                        </p>
                      )}
                    </div>
                    <Badge
                      className={
                        t.is_available
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {t.is_available ? "Available" : "Busy"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
