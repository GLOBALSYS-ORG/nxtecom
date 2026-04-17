import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { creditAPI, financeAPI } from "../lib/api";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { isAuthenticated } from "../store/auth";
import { CreditCard, AlertTriangle, Clock, ArrowLeft } from "lucide-react";

interface CreditLimit {
  id: string;
  creditor_name: string;
  debtor_name: string;
  credit_limit: string;
  used_amount: string;
  available_credit: string;
  risk_score: number;
  is_active: boolean;
}
interface CreditAccount {
  id: string;
  creditor_name: string;
  debtor_name: string;
  amount: string;
  amount_paid: string;
  outstanding: string;
  due_date: string;
  status: string;
  risk_score: number;
}

export default function CreditManagement() {
  const navigate = useNavigate();
  const [limits, setLimits] = useState<CreditLimit[]>([]);
  const [accounts, setAccounts] = useState<CreditAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"limits" | "accounts">("limits");

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [lRes, aRes] = await Promise.all([
        creditAPI.limits().catch(() => ({ data: [] })),
        financeAPI.credits().catch(() => ({ data: [] })),
      ]);
      const arr = (d: unknown) => {
        const data = d as Record<string, unknown>;
        return Array.isArray(data) ? data : (data.results as unknown[]) || [];
      };
      setLimits(arr(lRes.data) as CreditLimit[]);
      setAccounts(arr(aRes.data) as CreditAccount[]);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: string | number) => `UGX ${Number(n).toLocaleString()}`;
  const riskColor = (s: number) =>
    s <= 20
      ? "bg-green-100 text-green-800"
      : s <= 50
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800";
  const statusColor = (s: string) => {
    const m: Record<string, string> = {
      active: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
      defaulted: "bg-red-200 text-red-900",
    };
    return m[s] || "bg-slate-100 text-slate-800";
  };

  if (loading)
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto" />
        <p className="text-slate-600 mt-4">Loading credit data...</p>
      </div>
    );

  const totalCreditGiven = limits.reduce(
    (s, l) => s + Number(l.credit_limit),
    0
  );
  const totalUsed = limits.reduce((s, l) => s + Number(l.used_amount), 0);
  const totalOutstanding = accounts
    .filter((a) => a.status === "active")
    .reduce((s, a) => s + Number(a.outstanding || 0), 0);
  const overdueCount = accounts.filter((a) => a.status === "overdue").length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Credit Management
          </h1>
          <p className="text-slate-600">
            Manage credit limits, accounts, and aging
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            label: "Total Credit Limit",
            value: fmt(totalCreditGiven),
            icon: CreditCard,
            color: "text-blue-600",
          },
          {
            label: "Credit Used",
            value: fmt(totalUsed),
            icon: Clock,
            color: "text-amber-600",
          },
          {
            label: "Outstanding",
            value: fmt(totalOutstanding),
            icon: AlertTriangle,
            color: "text-red-600",
          },
          {
            label: "Overdue Accounts",
            value: overdueCount,
            icon: AlertTriangle,
            color: "text-red-600",
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
          onClick={() => setTab("limits")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
            tab === "limits"
              ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Credit Limits{" "}
          <Badge variant="secondary" className="ml-1">
            {limits.length}
          </Badge>
        </button>
        <button
          onClick={() => setTab("accounts")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
            tab === "accounts"
              ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Credit Accounts{" "}
          <Badge variant="secondary" className="ml-1">
            {accounts.length}
          </Badge>
        </button>
      </div>

      {tab === "limits" && (
        <div className="space-y-4">
          {limits.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-slate-500">
                No credit limits configured.
              </CardContent>
            </Card>
          ) : (
            limits.map((l) => (
              <Card key={l.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        Creditor: {l.creditor_name || "N/A"} → Debtor:{" "}
                        {l.debtor_name || "N/A"}
                      </p>
                      <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Credit Limit</p>
                          <p className="font-medium">{fmt(l.credit_limit)}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Used</p>
                          <p className="font-medium text-amber-600">
                            {fmt(l.used_amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Available</p>
                          <p className="font-medium text-green-600">
                            {fmt(l.available_credit)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-emerald-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (Number(l.used_amount) / Number(l.credit_limit)) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={riskColor(l.risk_score)}>
                        Risk: {l.risk_score}
                      </Badge>
                      <Badge
                        className={
                          l.is_active
                            ? "bg-green-100 text-green-800 ml-2"
                            : "bg-slate-100 text-slate-800 ml-2"
                        }
                      >
                        {l.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "accounts" && (
        <div className="space-y-4">
          {accounts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-slate-500">
                No credit accounts found.
              </CardContent>
            </Card>
          ) : (
            accounts.map((a) => (
              <Card key={a.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        Creditor: {a.creditor_name || "N/A"} → Debtor:{" "}
                        {a.debtor_name || "N/A"}
                      </p>
                      <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Amount</p>
                          <p className="font-medium">{fmt(a.amount)}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Paid</p>
                          <p className="font-medium text-green-600">
                            {fmt(a.amount_paid)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Outstanding</p>
                          <p className="font-medium text-red-600">
                            {fmt(a.outstanding)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">
                        Due: {new Date(a.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={statusColor(a.status)}>
                        {a.status}
                      </Badge>
                      <Badge className={`${riskColor(a.risk_score)} ml-2`}>
                        Risk: {a.risk_score}
                      </Badge>
                    </div>
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
