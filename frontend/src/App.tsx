import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import CartPage from "./pages/Cart";
import Orders from "./pages/Orders";
import Dashboard from "./pages/Dashboard";
import PaymentGateways from "./pages/PaymentGateways";
import InventoryPage from "./pages/Inventory";
import FinancialStatements from "./pages/FinancialStatements";
import FarmerDashboard from "./pages/FarmerDashboard";
import Production from "./pages/Production";
import CreditManagement from "./pages/CreditManagement";
import Logistics from "./pages/Logistics";
import BudgetExpenses from "./pages/BudgetExpenses";
import Aggregation from "./pages/Aggregation";
import ProcessingPage from "./pages/Processing";
import Warehouses from "./pages/Warehouses";
import Intelligence from "./pages/Intelligence";
import AffiliatesDashboard from "./pages/AffiliatesDashboard";
import Contracts from "./pages/Contracts";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<Products />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/payment-gateways" element={<PaymentGateways />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/financial-statements" element={<FinancialStatements />} />
            <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
            <Route path="/production" element={<Production />} />
            <Route path="/credit-management" element={<CreditManagement />} />
            <Route path="/logistics" element={<Logistics />} />
            <Route path="/budget-expenses" element={<BudgetExpenses />} />
            <Route path="/aggregation" element={<Aggregation />} />
            <Route path="/processing" element={<ProcessingPage />} />
            <Route path="/warehouses" element={<Warehouses />} />
            <Route path="/intelligence" element={<Intelligence />} />
            <Route path="/affiliates-dashboard" element={<AffiliatesDashboard />} />
            <Route path="/contracts" element={<Contracts />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
