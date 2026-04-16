import { Store } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Store className="h-6 w-6 text-emerald-400" />
              <span className="text-lg font-bold text-white">NxtEcom</span>
            </div>
            <p className="text-sm">
              Next generation commerce infrastructure for Africa.
              Connecting companies, depots, wholesalers, retailers, and customers.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">For Businesses</h3>
            <ul className="space-y-2 text-sm">
              <li>Companies</li>
              <li>Wholesalers</li>
              <li>Retailers</li>
              <li>Depot Management</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Features</h3>
            <ul className="space-y-2 text-sm">
              <li>Supply Chain Tracking</li>
              <li>Inventory Management</li>
              <li>Financial Reports</li>
              <li>Market Intelligence</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>Help Center</li>
              <li>Contact Us</li>
              <li>API Documentation</li>
              <li>Affiliate Program</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} NxtEcom. Built for African commerce.</p>
        </div>
      </div>
    </footer>
  );
}
