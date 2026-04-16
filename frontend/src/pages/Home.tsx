import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Store, Truck, BarChart3, Shield, Users, Globe } from "lucide-react";

const features = [
  { icon: Store, title: "Online Storefront", desc: "Modern e-commerce for wholesalers and retailers. No physical shop needed." },
  { icon: Truck, title: "Supply Chain", desc: "Track products from company to depot to wholesaler to retailer to customer." },
  { icon: BarChart3, title: "Market Intelligence", desc: "Real-time prices from local markets. Price comparison and demand insights." },
  { icon: Shield, title: "Secure Payments", desc: "Mobile money and bank integration with fraud detection." },
  { icon: Users, title: "Affiliate Program", desc: "Earn 20% commission on subscription renewals through referrals." },
  { icon: Globe, title: "Built for Africa", desc: "Designed for emerging markets. Works in low-resource environments." },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Next Generation Commerce for Africa
            </h1>
            <p className="text-lg md:text-xl text-emerald-100 mb-8">
              Connecting companies, depots, wholesalers, retailers, and customers
              on one unified platform. Digitize your supply chain today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 w-full sm:w-auto">
                  Browse Products
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-emerald-700 w-full sm:w-auto">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Supply Chain Flow */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            {["Company", "Depot", "Wholesaler", "Retailer", "Customer"].map((step, i) => (
              <div key={step} className="flex items-center">
                <div className="bg-emerald-100 text-emerald-700 px-6 py-3 rounded-lg font-semibold text-center min-w-28">
                  {step}
                </div>
                {i < 4 && <span className="text-emerald-400 text-2xl mx-2 hidden md:block">&rarr;</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <f.icon className="h-10 w-10 text-emerald-600 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-slate-600 text-sm">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-emerald-700 text-white">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your business?</h2>
          <p className="text-emerald-100 mb-8">
            Join thousands of businesses already using NxtEcom to streamline their supply chain.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50">
              Start Free Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
