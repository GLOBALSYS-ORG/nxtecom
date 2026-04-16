import { useState, useEffect } from "react";
import { productsAPI, cartAPI } from "../lib/api";
import { Product, Category } from "../types";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { isAuthenticated } from "../store/auth";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Search, Package } from "lucide-react";

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProducts();
    productsAPI.categories().then((res) => {
      const data = res.data;
      setCategories(Array.isArray(data) ? data : data.results || []);
    }).catch(() => {});
  }, []);

  const loadProducts = async (params?: Record<string, string>) => {
    setLoading(true);
    try {
      const res = await productsAPI.list(params);
      const data = res.data;
      setProducts(Array.isArray(data) ? data : data.results || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (selectedCategory) params.category = selectedCategory;
    loadProducts(params);
  };

  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    setAddingToCart(product.id);
    try {
      await cartAPI.addItem(product.id, 1);
      setMessage(`${product.name} added to cart!`);
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("Failed to add to cart. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setAddingToCart(null);
    }
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return `UGX ${num.toLocaleString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-600 mt-1">Browse our product catalog</p>
        </div>
        {isAuthenticated() && (
          <Button variant="outline" onClick={() => navigate("/cart")} className="mt-4 md:mt-0">
            <ShoppingCart className="h-4 w-4 mr-2" /> View Cart
          </Button>
        )}
      </div>

      {message && (
        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-md mb-6 text-sm">
          {message}
        </div>
      )}

      {/* Search and Filter */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Search</Button>
      </form>

      {/* Category Badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge
          variant={selectedCategory === "" ? "default" : "secondary"}
          className="cursor-pointer"
          onClick={() => { setSelectedCategory(""); loadProducts(); }}
        >
          All
        </Badge>
        {categories.map((cat) => (
          <Badge
            key={cat.id}
            variant={selectedCategory === cat.slug ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => { setSelectedCategory(cat.slug); loadProducts({ category: cat.slug }); }}
          >
            {cat.name}
          </Badge>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-slate-600 mt-4">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-emerald-50 to-slate-100 flex items-center justify-center">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-16 w-16 text-emerald-300" />
                )}
              </div>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-sm text-slate-900 line-clamp-2">{product.name}</h3>
                  <Badge variant="secondary" className="ml-2 text-xs shrink-0">{product.unit}</Badge>
                </div>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-emerald-600">{formatPrice(product.base_price)}</span>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleAddToCart(product)}
                    disabled={addingToCart === product.id}
                  >
                    {addingToCart === product.id ? (
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <><ShoppingCart className="h-3 w-3 mr-1" /> Add</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
