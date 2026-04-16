import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, LogOut, Menu, X, Store } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { isAuthenticated, getUser, clearAuth } from "../../store/auth";
import { useState, useEffect } from "react";
import { cartAPI } from "../../lib/api";

export default function Navbar() {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const user = getUser();
  const [cartCount, setCartCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const fetchCartCount = () => {
    if (authenticated) {
      cartAPI.get().then((res) => setCartCount(res.data.total_items || 0)).catch(() => {});
    }
  };

  useEffect(() => {
    fetchCartCount();
    const handler = () => fetchCartCount();
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, [authenticated]);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Store className="h-8 w-8 text-emerald-600" />
              <span className="text-xl font-bold text-slate-900">NxtEcom</span>
            </Link>
            <div className="hidden md:flex ml-10 space-x-4">
              <Link to="/products" className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium">
                Products
              </Link>
              {authenticated && (
                <>
                  <Link to="/orders" className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium">
                    Orders
                  </Link>
                  <Link to="/dashboard" className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium">
                    Dashboard
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {authenticated ? (
              <>
                <Link to="/cart" className="relative p-2 text-slate-600 hover:text-slate-900">
                  <ShoppingCart className="h-6 w-6" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs" variant="destructive">
                      {cartCount}
                    </Badge>
                  )}
                </Link>
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <User className="h-4 w-4" />
                  <span>{user?.first_name || user?.username}</span>
                  <Badge variant="secondary">{user?.role}</Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-1" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-slate-600">
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            <Link to="/products" className="block px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md" onClick={() => setMobileOpen(false)}>
              Products
            </Link>
            {authenticated ? (
              <>
                <Link to="/cart" className="block px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md" onClick={() => setMobileOpen(false)}>
                  Cart {cartCount > 0 && `(${cartCount})`}
                </Link>
                <Link to="/orders" className="block px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md" onClick={() => setMobileOpen(false)}>
                  Orders
                </Link>
                <Link to="/dashboard" className="block px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md" onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="block px-3 py-2 text-emerald-600 hover:bg-emerald-50 rounded-md" onClick={() => setMobileOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
