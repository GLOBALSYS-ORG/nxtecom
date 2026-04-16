import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { authAPI } from "../lib/api";
import { Store } from "lucide-react";

const ROLES = [
  { value: "customer", label: "Customer", desc: "Shop and buy products" },
  { value: "retailer", label: "Retailer", desc: "Sell products to customers" },
  { value: "wholesaler", label: "Wholesaler", desc: "Supply retailers in bulk" },
  { value: "company", label: "Company", desc: "Manufacture or supply products" },
  { value: "affiliate", label: "Affiliate", desc: "Earn commissions by referring" },
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "", email: "", password: "", password_confirm: "",
    first_name: "", last_name: "", phone: "", role: "customer",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.password_confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await authAPI.register(form);
      navigate("/login");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: Record<string, string[]> } };
      const data = axiosErr.response?.data;
      if (data) {
        const messages = Object.values(data).flat().join(" ");
        setError(messages || "Registration failed.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Store className="h-10 w-10 text-emerald-600" />
          </div>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Join NxtEcom and start trading</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">{error}</div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                <Input name="first_name" value={form.first_name} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <Input name="last_name" value={form.last_name} onChange={handleChange} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <Input name="username" value={form.username} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <Input name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <Input name="phone" value={form.phone} onChange={handleChange} placeholder="+256..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">I am a...</label>
              <div className="grid grid-cols-1 gap-2 mt-1">
                {ROLES.map((role) => (
                  <label
                    key={role.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      form.role === role.value ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={form.role === role.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div>
                      <span className="font-medium text-sm">{role.label}</span>
                      <span className="text-xs text-slate-500 ml-2">{role.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <Input name="password" type="password" value={form.password} onChange={handleChange} required minLength={8} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
              <Input name="password_confirm" type="password" value={form.password_confirm} onChange={handleChange} required />
            </div>
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
            <p className="text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="text-emerald-600 hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
