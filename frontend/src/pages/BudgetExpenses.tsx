import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { budgetAPI } from "../lib/api";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { isAuthenticated } from "../store/auth";
import { Wallet, TrendingDown, ArrowLeft, Receipt } from "lucide-react";

interface Budget {
  id: string;
  name: string;
  category: string;
  amount: string;
  spent: string;
  remaining: string;
  period: string;
  start_date: string;
  end_date: string;
}
interface Expense {
  id: string;
  category: string;
  category_display: string;
  description: string;
  amount: string;
  date: string;
}
interface Invoice {
  id: string;
  invoice_number: string;
  issuer_name: string;
  recipient_name: string;
  total_amount: string;
  status: string;
  status_display: string;
  due_date: string;
  issued_date: string;
}

export default function BudgetExpenses() {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"budgets" | "expenses" | "invoices">(
    "budgets"
  );

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [bRes, eRes, iRes] = await Promise.all([
        budgetAPI.list().catch(() => ({ data: [] })),
        budgetAPI.expenses().catch(() => ({ data: [] })),
        budgetAPI.invoices().catch(() => ({ data: [] })),
      ]);
      const arr = (d: unknown) => {
        const data = d as Record<string, unknown>;
        return Array.isArray(data) ? data : (data.results as unknown[]) || [];
      };
      setBudgets(arr(bRes.data) as Budget[]);
      setExpenses(arr(eRes.data) as Expense[]);
      setInvoices(arr(iRes.data) as Invoice[]);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: string | number) => `UGX ${Number(n).toLocaleString()}`;
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalBudget = budgets.reduce((s, b) => s + Number(b.amount), 0);

  if (loading)
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto" />
        <p className="text-slate-600 mt-4">Loading data...</p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Budgets & Expenses
          </h1>
          <p className="text-slate-600">
            Track budgets, expenses, and invoices
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Budget</p>
                <p className="text-2xl font-bold">{fmt(totalBudget)}</p>
              </div>
              <Wallet className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Expenses</p>
                <p className="text-2xl font-bold">{fmt(totalExpenses)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Invoices</p>
                <p className="text-2xl font-bold">{invoices.length}</p>
              </div>
              <Receipt className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-2">
        {(
          [
            { key: "budgets" as const, label: "Budgets", count: budgets.length },
            {
              key: "expenses" as const,
              label: "Expenses",
              count: expenses.length,
            },
            {
              key: "invoices" as const,
              label: "Invoices",
              count: invoices.length,
            },
          ] as const
        ).map((t) => (
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

      {tab === "budgets" && (
        <div className="space-y-4">
          {budgets.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-slate-500">
                No budgets configured.
              </CardContent>
            </Card>
          ) : (
            budgets.map((b) => (
              <Card key={b.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium">{b.name}</p>
                      <p className="text-sm text-slate-500 capitalize">
                        {b.category} | {b.period}
                      </p>
                      <p className="text-sm text-slate-400">
                        {new Date(b.start_date).toLocaleDateString()} -{" "}
                        {new Date(b.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Budget</p>
                      <p className="font-bold">{fmt(b.amount)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Spent: {fmt(b.spent)}</span>
                    <span>Remaining: {fmt(b.remaining)}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        Number(b.spent) / Number(b.amount) > 0.9
                          ? "bg-red-500"
                          : Number(b.spent) / Number(b.amount) > 0.7
                            ? "bg-yellow-500"
                            : "bg-emerald-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          (Number(b.spent) / Number(b.amount)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "expenses" && (
        <div className="space-y-3">
          {expenses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-slate-500">
                No expenses recorded.
              </CardContent>
            </Card>
          ) : (
            expenses.map((e) => (
              <Card key={e.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{e.description}</p>
                      <p className="text-xs text-slate-500 capitalize">
                        {e.category_display || e.category} |{" "}
                        {new Date(e.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-bold text-red-600">{fmt(e.amount)}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "invoices" && (
        <div className="space-y-4">
          {invoices.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-slate-500">
                No invoices found.
              </CardContent>
            </Card>
          ) : (
            invoices.map((i) => (
              <Card key={i.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        Invoice #{i.invoice_number}
                      </p>
                      <p className="text-sm text-slate-500">
                        {i.issuer_name} → {i.recipient_name}
                      </p>
                      <p className="text-sm text-slate-400">
                        Due: {new Date(i.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{fmt(i.total_amount)}</p>
                      <Badge
                        className={
                          i.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : i.status === "overdue"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                        }
                      >
                        {i.status_display || i.status}
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
