import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { inventoryAPI, productsAPI } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { isAuthenticated, getUser } from "../store/auth";
import {
  Package, AlertTriangle, Plus, Trash2, ArrowLeft, Edit2, Save, X,
} from "lucide-react";

interface InventoryItem {
  id: string;
  product: string;
  product_name?: string;
  owner_type: string;
  owner_id: string;
  quantity: number;
  reorder_level: number;
  last_restocked: string | null;
  updated_at: string;
}

interface ProductOption {
  id: string;
  name: string;
}

export default function Inventory() {
  const navigate = useNavigate();
  const user = getUser();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState(0);
  const [editReorder, setEditReorder] = useState(0);
  const [newItem, setNewItem] = useState({ product: "", quantity: 0, reorder_level: 10 });
  const [message, setMessage] = useState("");

  const allowedRoles = ["retailer", "wholesaler", "company", "depot", "admin"];

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
      const [invRes, prodRes] = await Promise.all([
        inventoryAPI.list(),
        productsAPI.list(),
      ]);
      const invData = invRes.data;
      const inv = Array.isArray(invData) ? invData : invData.results || [];
      setInventory(inv);

      const prodData = prodRes.data;
      const prods = Array.isArray(prodData) ? prodData : prodData.results || [];
      setProducts(prods.map((p: { id: string; name: string }) => ({ id: p.id, name: p.name })));
    } catch {
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newItem.product) {
      setMessage("Please select a product.");
      return;
    }
    try {
      const ownerType = user?.role || "retailer";
      await inventoryAPI.create({
        product: newItem.product,
        owner_type: ownerType,
        owner_id: user?.id,
        quantity: newItem.quantity,
        reorder_level: newItem.reorder_level,
      });
      setMessage("Inventory item added!");
      setShowAdd(false);
      setNewItem({ product: "", quantity: 0, reorder_level: 10 });
      loadData();
    } catch {
      setMessage("Failed to add inventory item.");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const handleUpdate = async (id: string) => {
    try {
      await inventoryAPI.update(id, { quantity: editQty, reorder_level: editReorder });
      setMessage("Inventory updated!");
      setEditingId(null);
      loadData();
    } catch {
      setMessage("Failed to update.");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this inventory entry?")) return;
    try {
      await inventoryAPI.delete(id);
      setMessage("Inventory entry deleted.");
      loadData();
    } catch {
      setMessage("Failed to delete.");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const getProductName = (productId: string) => {
    return products.find((p) => p.id === productId)?.name || productId;
  };

  const lowStockCount = inventory.filter((i) => i.quantity <= i.reorder_level).length;
  const totalItems = inventory.reduce((sum, i) => sum + i.quantity, 0);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-slate-600 mt-4">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate("/dashboard")} className="text-sm text-slate-500 hover:text-slate-700 mb-4 flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </button>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Package className="h-8 w-8 text-emerald-600" />
            Inventory Management
          </h1>
          <p className="text-slate-600 mt-1">Track stock levels and manage your product inventory</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Stock
        </Button>
      </div>

      {message && (
        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-md mb-6 text-sm">{message}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total SKUs</p>
                <p className="text-2xl font-bold">{inventory.length}</p>
              </div>
              <Package className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Units</p>
                <p className="text-2xl font-bold">{totalItems.toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-red-600">{lowStockCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Stock Form */}
      {showAdd && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Add New Stock Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product *</label>
                <select
                  value={newItem.product}
                  onChange={(e) => setNewItem({ ...newItem, product: e.target.value })}
                  className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                >
                  <option value="">Select a product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                <Input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reorder Level</label>
                <Input
                  type="number"
                  value={newItem.reorder_level}
                  onChange={(e) => setNewItem({ ...newItem, reorder_level: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAdd}>Add Stock</Button>
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Stock Levels</CardTitle>
        </CardHeader>
        <CardContent>
          {inventory.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No inventory entries yet. Add your first stock item.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left p-3 font-medium text-slate-600">Product</th>
                    <th className="text-center p-3 font-medium text-slate-600">Quantity</th>
                    <th className="text-center p-3 font-medium text-slate-600">Reorder Level</th>
                    <th className="text-center p-3 font-medium text-slate-600">Status</th>
                    <th className="text-center p-3 font-medium text-slate-600">Last Restocked</th>
                    <th className="text-right p-3 font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-medium">{item.product_name || getProductName(item.product)}</td>
                      <td className="p-3 text-center">
                        {editingId === item.id ? (
                          <Input
                            type="number"
                            value={editQty}
                            onChange={(e) => setEditQty(parseInt(e.target.value) || 0)}
                            className="w-20 mx-auto text-center"
                            min={0}
                          />
                        ) : (
                          <span className="font-bold">{item.quantity}</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {editingId === item.id ? (
                          <Input
                            type="number"
                            value={editReorder}
                            onChange={(e) => setEditReorder(parseInt(e.target.value) || 0)}
                            className="w-20 mx-auto text-center"
                            min={0}
                          />
                        ) : (
                          item.reorder_level
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {item.quantity <= item.reorder_level ? (
                          <Badge variant="destructive">Low Stock</Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-800">In Stock</Badge>
                        )}
                      </td>
                      <td className="p-3 text-center text-slate-500">
                        {item.last_restocked
                          ? new Date(item.last_restocked).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="p-3 text-right">
                        {editingId === item.id ? (
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleUpdate(item.id)}>
                              <Save className="h-4 w-4 text-emerald-600" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                              <X className="h-4 w-4 text-slate-500" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingId(item.id);
                                setEditQty(item.quantity);
                                setEditReorder(item.reorder_level);
                              }}
                            >
                              <Edit2 className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
