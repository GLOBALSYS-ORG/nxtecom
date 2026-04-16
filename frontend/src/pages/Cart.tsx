import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { cartAPI, ordersAPI } from "../lib/api";
import { Cart as CartType } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { isAuthenticated } from "../store/auth";
import { ShoppingCart, Trash2, Plus, Minus, Package, ArrowLeft, CreditCard } from "lucide-react";

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mobile_money");
  const [orderNotes, setOrderNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    loadCart();
  }, [navigate]);

  const loadCart = async () => {
    try {
      const res = await cartAPI.get();
      setCart(res.data);
    } catch {
      setError("Failed to load cart.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdating(itemId);
    try {
      const res = await cartAPI.updateItem(itemId, newQuantity);
      setCart(res.data);
    } catch {
      setError("Failed to update quantity.");
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdating(itemId);
    try {
      const res = await cartAPI.removeItem(itemId);
      setCart(res.data);
    } catch {
      setError("Failed to remove item.");
    } finally {
      setUpdating(null);
    }
  };

  const handleClearCart = async () => {
    try {
      await cartAPI.clear();
      setCart(null);
      loadCart();
    } catch {
      setError("Failed to clear cart.");
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryAddress.trim()) {
      setError("Please enter a delivery address.");
      return;
    }
    setCheckingOut(true);
    setError("");
    try {
      await ordersAPI.create({
        delivery_address: deliveryAddress,
        payment_method: paymentMethod,
        notes: orderNotes,
      });
      navigate("/orders");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || "Checkout failed. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  const formatPrice = (price: string | number) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return `UGX ${num.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-slate-600 mt-4">Loading cart...</p>
      </div>
    );
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="h-8 w-8 text-emerald-600" />
            Shopping Cart
          </h1>
          <p className="text-slate-600 mt-1">
            {isEmpty ? "Your cart is empty" : `${cart?.total_items || 0} item(s) in your cart`}
          </p>
        </div>
        <Link to="/products">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Continue Shopping
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm">{error}</div>
      )}

      {isEmpty ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="h-20 w-20 text-slate-200 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-700 mb-2">Your cart is empty</h2>
            <p className="text-slate-500 mb-6">Add some products to get started!</p>
            <Link to="/products">
              <Button className="bg-emerald-600 hover:bg-emerald-700">Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="h-20 w-20 bg-gradient-to-br from-emerald-50 to-slate-100 rounded-lg flex items-center justify-center shrink-0">
                      <Package className="h-8 w-8 text-emerald-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {item.product_detail?.name || "Product"}
                      </h3>
                      <p className="text-sm text-slate-500">
                        Unit price: {formatPrice(item.unit_price)}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={updating === item.id || item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-10 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={updating === item.id}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-emerald-600">{formatPrice(item.line_total)}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={updating === item.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="flex justify-end">
              <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700" onClick={handleClearCart}>
                <Trash2 className="h-4 w-4 mr-1" /> Clear Cart
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-slate-600 truncate mr-2">
                        {item.product_detail?.name || "Item"} x{item.quantity}
                      </span>
                      <span className="shrink-0">{formatPrice(item.line_total)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal</span>
                    <span>{formatPrice(cart?.subtotal || "0")}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-slate-600">Delivery</span>
                    <span className="text-emerald-600">Calculated at checkout</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-emerald-600">{formatPrice(cart?.subtotal || "0")}</span>
                  </div>
                </div>

                {!showCheckout ? (
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    size="lg"
                    onClick={() => setShowCheckout(true)}
                  >
                    <CreditCard className="h-4 w-4 mr-2" /> Proceed to Checkout
                  </Button>
                ) : (
                  <form onSubmit={handleCheckout} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Address</label>
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        rows={2}
                        placeholder="Enter your delivery address"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                      >
                        <option value="mobile_money">Mobile Money</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cash_on_delivery">Cash on Delivery</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
                      <textarea
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        rows={2}
                        placeholder="Any special instructions?"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      size="lg"
                      disabled={checkingOut}
                    >
                      {checkingOut ? "Placing Order..." : "Place Order"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowCheckout(false)}
                    >
                      Back
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
