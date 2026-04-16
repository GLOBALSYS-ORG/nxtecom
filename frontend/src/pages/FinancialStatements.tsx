import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { financeAPI } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { isAuthenticated, getUser } from "../store/auth";
import {
  DollarSign, TrendingUp, TrendingDown, ArrowLeft,
  CreditCard, FileText, Users,
} from "lucide-react";

interface FinanceReport {
  revenue: number;
  expenses: number;
  profit: number;
  total_transactions: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: string;
  description: string;
  reference: string;
  created_at: string;
}

interface CreditAccount {
  id: string;
  creditor: string;
  creditor_name?: string;
  debtor: string;
  debtor_name?: string;
  amount: string;
  amount_paid: string;
  balance: string;
  status: string;
  risk_score: number;
  due_date: string;
  created_at: string;
}

export default function FinancialStatements() {
  const navigate = useNavigate();
  const user = getUser();
  const [report, setReport] = useState<FinanceReport | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [credits, setCredits] = useState<CreditAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "credits">("overview");

  const allowedRoles = ["retailer", "wholesaler", "company", "admin"];

  useEffect(() => {
    if (!isAuthenticated() || !allowedRoles.includes(user?.role || "")) {
      navigate("/dashboard");
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportRes, txRes, creditRes] = await Promise.all([
        financeAPI.report().catch(() => ({ data: null })),
        financeAPI.transactions().catch(() => ({ data: [] })),
        financeAPI.credits().catch(() => ({ data: [] })),
      ]);
      setReport(reportRes.data);

      const txData = txRes.data;
      setTransactions(Array.isArray(txData) ? txData : txData.results || []);

      const crData = creditRes.data;
      setCredits(Array.isArray(crData) ? crData : crData.results || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `UGX ${num.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-slate-600 mt-4">Loading financial data...</p>
      </div>
    );
  }

  const totalCredit = credits.reduce((sum, c) => sum + parseFloat(c.amount || "0"), 0);
  const outstandingCredit = credits.reduce((sum, c) => sum + parseFloat(c.balance || "0"), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate("/dashboard")} className="text-sm text-slate-500 hover:text-slate-700 mb-4 flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <FileText className="h-8 w-8 text-emerald-600" />
          Financial Statements
        </h1>
        <p className="text-slate-600 mt-1">Revenue, expenses, profit/loss, and credit tracking</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatPrice(report?.revenue || 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatPrice(report?.expenses || 0)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Net Profit/Loss</p>
                <p className={`text-2xl font-bold ${(report?.profit || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatPrice(report?.profit || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Transactions</p>
                <p className="text-2xl font-bold">{report?.total_transactions || 0}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Summary */}
      {credits.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Credit Given</p>
                  <p className="text-2xl font-bold text-orange-600">{formatPrice(totalCredit)}</p>
                </div>
                <Users className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-red-600">{formatPrice(outstandingCredit)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {(["overview", "transactions", "credits"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === tab
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profit & Loss Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span className="text-sm font-medium text-green-800">Total Revenue</span>
                  <span className="font-bold text-green-700">{formatPrice(report?.revenue || 0)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                  <span className="text-sm font-medium text-red-800">Total Expenses</span>
                  <span className="font-bold text-red-700">{formatPrice(report?.expenses || 0)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                    <span className="text-sm font-bold text-slate-800">Net Profit/Loss</span>
                    <span className={`font-bold text-lg ${(report?.profit || 0) >= 0 ? "text-green-700" : "text-red-700"}`}>
                      {formatPrice(report?.profit || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Credit Accounts ({credits.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {credits.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">No credit accounts.</p>
              ) : (
                <div className="space-y-3">
                  {credits.slice(0, 5).map((credit) => (
                    <div key={credit.id} className="flex justify-between items-center p-3 bg-slate-50 rounded">
                      <div>
                        <p className="text-sm font-medium">{credit.debtor_name || credit.debtor}</p>
                        <p className="text-xs text-slate-500">Due: {new Date(credit.due_date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{formatPrice(credit.balance)}</p>
                        <Badge
                          variant={credit.status === "paid" ? "default" : credit.status === "overdue" ? "destructive" : "secondary"}
                        >
                          {credit.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No transactions recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="text-left p-3 font-medium text-slate-600">Date</th>
                      <th className="text-left p-3 font-medium text-slate-600">Description</th>
                      <th className="text-center p-3 font-medium text-slate-600">Type</th>
                      <th className="text-left p-3 font-medium text-slate-600">Reference</th>
                      <th className="text-right p-3 font-medium text-slate-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b hover:bg-slate-50">
                        <td className="p-3 text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</td>
                        <td className="p-3">{tx.description}</td>
                        <td className="p-3 text-center">
                          <Badge variant={tx.type === "credit" ? "default" : "destructive"}>
                            {tx.type}
                          </Badge>
                        </td>
                        <td className="p-3 text-slate-500">{tx.reference || "-"}</td>
                        <td className={`p-3 text-right font-bold ${tx.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                          {tx.type === "credit" ? "+" : "-"}{formatPrice(tx.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Credits Tab */}
      {activeTab === "credits" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Credit Accounts - Goods Given on Credit</CardTitle>
          </CardHeader>
          <CardContent>
            {credits.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No credit accounts.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="text-left p-3 font-medium text-slate-600">Debtor</th>
                      <th className="text-right p-3 font-medium text-slate-600">Total Amount</th>
                      <th className="text-right p-3 font-medium text-slate-600">Paid</th>
                      <th className="text-right p-3 font-medium text-slate-600">Balance</th>
                      <th className="text-center p-3 font-medium text-slate-600">Status</th>
                      <th className="text-center p-3 font-medium text-slate-600">Risk</th>
                      <th className="text-center p-3 font-medium text-slate-600">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {credits.map((credit) => (
                      <tr key={credit.id} className="border-b hover:bg-slate-50">
                        <td className="p-3 font-medium">{credit.debtor_name || credit.debtor}</td>
                        <td className="p-3 text-right">{formatPrice(credit.amount)}</td>
                        <td className="p-3 text-right text-green-600">{formatPrice(credit.amount_paid)}</td>
                        <td className="p-3 text-right font-bold text-red-600">{formatPrice(credit.balance)}</td>
                        <td className="p-3 text-center">
                          <Badge
                            variant={credit.status === "paid" ? "default" : credit.status === "overdue" ? "destructive" : "secondary"}
                          >
                            {credit.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`font-bold ${credit.risk_score > 70 ? "text-red-600" : credit.risk_score > 40 ? "text-yellow-600" : "text-green-600"}`}>
                            {credit.risk_score}%
                          </span>
                        </td>
                        <td className="p-3 text-center text-slate-500">
                          {new Date(credit.due_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
