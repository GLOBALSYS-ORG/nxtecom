import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { paymentGatewayAPI } from "../lib/api";
import { PaymentGateway, PaymentProvider } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { isAuthenticated, getUser } from "../store/auth";
import {
  CreditCard, Plus, Trash2, Power, PowerOff, Settings, Eye, EyeOff, ChevronLeft,
} from "lucide-react";

interface GatewayFormData {
  provider: string;
  display_name: string;
  api_key: string;
  api_secret: string;
  webhook_secret: string;
  merchant_id: string;
  environment: string;
}

const emptyForm: GatewayFormData = {
  provider: "",
  display_name: "",
  api_key: "",
  api_secret: "",
  webhook_secret: "",
  merchant_id: "",
  environment: "sandbox",
};

export default function PaymentGateways() {
  const navigate = useNavigate();
  const user = getUser();
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GatewayFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const sellerRoles = ["retailer", "wholesaler", "company", "depot", "admin"];

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    if (!sellerRoles.includes(user?.role || "")) {
      navigate("/dashboard");
      return;
    }
    loadData();
  }, [navigate, user?.role]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [gwRes, provRes] = await Promise.all([
        paymentGatewayAPI.list(),
        paymentGatewayAPI.providers(),
      ]);
      const gwData = gwRes.data;
      setGateways(Array.isArray(gwData) ? gwData : gwData.results || []);
      setProviders(provRes.data);
    } catch {
      setError("Failed to load payment gateways.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.provider || !form.display_name) {
      setError("Provider and display name are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await paymentGatewayAPI.update(editingId, form);
        setSuccess("Payment gateway updated successfully!");
      } else {
        await paymentGatewayAPI.create(form);
        setSuccess("Payment gateway added successfully!");
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadData();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: Record<string, string[]> } };
      const data = axiosErr.response?.data;
      if (data) {
        const msgs = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join("; ");
        setError(msgs);
      } else {
        setError("Failed to save payment gateway.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (gw: PaymentGateway) => {
    setEditingId(gw.id);
    setForm({
      provider: gw.provider,
      display_name: gw.display_name,
      api_key: "",
      api_secret: "",
      webhook_secret: "",
      merchant_id: gw.merchant_id,
      environment: gw.environment,
    });
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this payment gateway?")) return;
    try {
      await paymentGatewayAPI.delete(id);
      setSuccess("Payment gateway deleted.");
      await loadData();
      setTimeout(() => setSuccess(""), 4000);
    } catch {
      setError("Failed to delete payment gateway.");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await paymentGatewayAPI.toggle(id);
      await loadData();
    } catch {
      setError("Failed to toggle payment gateway.");
    }
  };

  const toggleSecretVisibility = (id: string) => {
    setShowSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-slate-600 mt-4">Loading payment gateways...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="mb-2">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-emerald-600" />
            Payment Gateways
          </h1>
          <p className="text-slate-600 mt-1">
            Configure payment methods your customers can use at checkout
          </p>
        </div>
        {!showForm && (
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); setError(""); }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Gateway
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-6 text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-md mb-6 text-sm">{success}</div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="mb-8 border-emerald-200">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId ? "Edit Payment Gateway" : "Add New Payment Gateway"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Provider */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Provider *
                  </label>
                  <select
                    value={form.provider}
                    onChange={(e) => {
                      const prov = providers.find((p) => p.value === e.target.value);
                      setForm({
                        ...form,
                        provider: e.target.value,
                        display_name: form.display_name || (prov ? `Pay with ${prov.label}` : ""),
                      });
                    }}
                    className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                    disabled={!!editingId}
                  >
                    <option value="">Select a provider...</option>
                    {providers.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Display Name *
                  </label>
                  <Input
                    value={form.display_name}
                    onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                    placeholder="e.g. Pay with MTN MoMo"
                  />
                </div>

                {/* API Key */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    API Key
                  </label>
                  <Input
                    value={form.api_key}
                    onChange={(e) => setForm({ ...form, api_key: e.target.value })}
                    placeholder={editingId ? "Leave blank to keep existing" : "Enter API key"}
                    type="password"
                  />
                </div>

                {/* API Secret */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    API Secret
                  </label>
                  <Input
                    value={form.api_secret}
                    onChange={(e) => setForm({ ...form, api_secret: e.target.value })}
                    placeholder={editingId ? "Leave blank to keep existing" : "Enter API secret"}
                    type="password"
                  />
                </div>

                {/* Webhook Secret */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Webhook Secret
                  </label>
                  <Input
                    value={form.webhook_secret}
                    onChange={(e) => setForm({ ...form, webhook_secret: e.target.value })}
                    placeholder={editingId ? "Leave blank to keep existing" : "Enter webhook secret"}
                    type="password"
                  />
                </div>

                {/* Merchant ID */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Merchant ID
                  </label>
                  <Input
                    value={form.merchant_id}
                    onChange={(e) => setForm({ ...form, merchant_id: e.target.value })}
                    placeholder="Enter merchant ID"
                  />
                </div>

                {/* Environment */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Environment
                  </label>
                  <select
                    value={form.environment}
                    onChange={(e) => setForm({ ...form, environment: e.target.value })}
                    className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                  >
                    <option value="sandbox">Sandbox (Testing)</option>
                    <option value="production">Production (Live)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Update Gateway" : "Add Gateway"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); setError(""); }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Gateway List */}
      {gateways.length === 0 && !showForm ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">No payment gateways configured</h3>
            <p className="text-slate-500 mb-4">
              Add a payment gateway so your customers can pay at checkout.
            </p>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => { setShowForm(true); setError(""); }}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Your First Gateway
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {gateways.map((gw) => (
            <Card key={gw.id} className={`transition-all ${gw.is_active ? "border-emerald-200" : "border-slate-200 opacity-70"}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{gw.display_name}</h3>
                      <Badge variant={gw.is_active ? "default" : "secondary"}>
                        {gw.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="secondary">{gw.environment}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{gw.provider_display}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">API Key:</span>
                        <code className="bg-slate-100 px-2 py-0.5 rounded text-xs">
                          {showSecrets[gw.id] ? gw.masked_api_key : "••••••••"}
                        </code>
                        <button
                          onClick={() => toggleSecretVisibility(gw.id)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          {showSecrets[gw.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      {gw.merchant_id && (
                        <div>
                          <span className="text-slate-500">Merchant ID:</span>{" "}
                          <span className="text-slate-700">{gw.merchant_id}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(gw.id)}
                      title={gw.is_active ? "Deactivate" : "Activate"}
                    >
                      {gw.is_active ? (
                        <PowerOff className="h-4 w-4 text-orange-500" />
                      ) : (
                        <Power className="h-4 w-4 text-emerald-500" />
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(gw)}>
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(gw.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
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
