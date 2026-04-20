import axios from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearAuth } from "../store/auth";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = getRefreshToken();
      if (refresh) {
        try {
          const res = await axios.post(`${API_BASE}/api/auth/refresh/`, { refresh });
          setTokens(res.data.access, res.data.refresh || refresh);
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch {
          clearAuth();
          window.location.href = "/login";
        }
      } else {
        clearAuth();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authAPI = {
  login: (username: string, password: string) =>
    api.post("/auth/login/", { username, password }),
  register: (data: Record<string, string>) =>
    api.post("/auth/register/", data),
  profile: () => api.get("/auth/profile/"),
  updateProfile: (data: Record<string, string>) =>
    api.put("/auth/profile/", data),
};

// Products
export const productsAPI = {
  list: (params?: Record<string, string>) =>
    api.get("/products/items/", { params }),
  get: (id: string) => api.get(`/products/items/${id}/`),
  categories: () => api.get("/products/categories/"),
};

// Cart
export const cartAPI = {
  get: () => api.get("/cart/"),
  addItem: (product_id: string, quantity: number) =>
    api.post("/cart/items/", { product_id, quantity }),
  updateItem: (itemId: string, quantity: number) =>
    api.put(`/cart/items/${itemId}/`, { quantity }),
  removeItem: (itemId: string) =>
    api.delete(`/cart/items/${itemId}/remove/`),
  clear: () => api.delete("/cart/clear/"),
};

// Orders
export const ordersAPI = {
  list: () => api.get("/orders/"),
  get: (id: string) => api.get(`/orders/${id}/`),
  create: (data: { delivery_address: string; payment_method: string; notes?: string }) =>
    api.post("/orders/create/", data),
};

// Finance
export const financeAPI = {
  report: () => api.get("/finance/reports/"),
  transactions: () => api.get("/finance/transactions/"),
  credits: () => api.get("/finance/credits/"),
};

// Inventory
export const inventoryAPI = {
  list: () => api.get("/products/inventory/"),
  get: (id: string) => api.get(`/products/inventory/${id}/`),
  create: (data: Record<string, unknown>) => api.post("/products/inventory/", data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/products/inventory/${id}/`, data),
  delete: (id: string) => api.delete(`/products/inventory/${id}/`),
};

// Market
export const marketAPI = {
  prices: () => api.get("/market/prices/"),
};

// Production
export const productionAPI = {
  crops: () => api.get("/production/crops/"),
  planting: () => api.get("/production/planting/"),
  createPlanting: (data: Record<string, unknown>) => api.post("/production/planting/", data),
  harvests: () => api.get("/production/harvests/"),
  createHarvest: (data: Record<string, unknown>) => api.post("/production/harvests/", data),
  livestock: () => api.get("/production/livestock/"),
  createLivestock: (data: Record<string, unknown>) => api.post("/production/livestock/", data),
  purchaseOffers: () => api.get("/production/purchase-offers/"),
  acceptOffer: (id: string) => api.post(`/production/purchase-offers/${id}/accept/`),
  rejectOffer: (id: string) => api.post(`/production/purchase-offers/${id}/reject/`),
};

// Logistics
export const logisticsAPI = {
  shipments: () => api.get("/logistics/shipments/"),
  getShipment: (id: string) => api.get(`/logistics/shipments/${id}/`),
  tracking: (id: string) => api.get(`/logistics/shipments/${id}/tracking/`),
  transporters: () => api.get("/logistics/transporters/"),
};

// Credit
export const creditAPI = {
  limits: () => api.get("/finance/credit-limits/"),
  createLimit: (data: Record<string, unknown>) => api.post("/finance/credit-limits/", data),
};

// Budgets & Expenses
export const budgetAPI = {
  list: () => api.get("/finance/budgets/"),
  create: (data: Record<string, unknown>) => api.post("/finance/budgets/", data),
  expenses: () => api.get("/finance/expenses/"),
  createExpense: (data: Record<string, unknown>) => api.post("/finance/expenses/", data),
  invoices: () => api.get("/finance/invoices/"),
};

// Aggregation
export const aggregationAPI = {
  centers: () => api.get("/aggregation/centers/"),
  createCenter: (data: Record<string, unknown>) => api.post("/aggregation/centers/", data),
  batches: () => api.get("/aggregation/batches/"),
  createBatch: (data: Record<string, unknown>) => api.post("/aggregation/batches/", data),
  intakes: () => api.get("/aggregation/intakes/"),
  createIntake: (data: Record<string, unknown>) => api.post("/aggregation/intakes/", data),
  qualityAssessments: () => api.get("/aggregation/quality-assessments/"),
};

// Processing
export const processingAPI = {
  facilities: () => api.get("/processing/facilities/"),
  createFacility: (data: Record<string, unknown>) => api.post("/processing/facilities/", data),
  jobs: () => api.get("/processing/jobs/"),
  createJob: (data: Record<string, unknown>) => api.post("/processing/jobs/", data),
  costs: () => api.get("/processing/costs/"),
  yields: () => api.get("/processing/yields/"),
};

// Intelligence
export const intelligenceAPI = {
  demandForecasts: () => api.get("/intelligence/demand-forecasts/"),
  supplyDemand: () => api.get("/intelligence/supply-demand/"),
  pricingRules: () => api.get("/intelligence/pricing-rules/"),
  createPricingRule: (data: Record<string, unknown>) => api.post("/intelligence/pricing-rules/", data),
  analytics: () => api.get("/intelligence/analytics/"),
};

// Supply Contracts
export const contractsAPI = {
  list: () => api.get("/production/supply-contracts/"),
  create: (data: Record<string, unknown>) => api.post("/production/supply-contracts/", data),
  get: (id: string) => api.get(`/production/supply-contracts/${id}/`),
  harvestForecasts: () => api.get("/production/harvest-forecasts/"),
};

// Warehouses
export const warehouseAPI = {
  list: () => api.get("/logistics/warehouses/"),
  create: (data: Record<string, unknown>) => api.post("/logistics/warehouses/", data),
  stock: () => api.get("/logistics/warehouse-stock/"),
  deliverySchedules: () => api.get("/logistics/delivery-schedules/"),
};

// Farmer Payments
export const farmerPaymentAPI = {
  list: () => api.get("/finance/farmer-payments/"),
  create: (data: Record<string, unknown>) => api.post("/finance/farmer-payments/", data),
  batchCosts: () => api.get("/finance/batch-costs/"),
  profitMargins: () => api.get("/finance/profit-margins/"),
};

// Affiliate Products & Performance
export const affiliateExtAPI = {
  products: () => api.get("/affiliate/products/"),
  createProduct: (data: Record<string, unknown>) => api.post("/affiliate/products/", data),
  performance: () => api.get("/affiliate/performance/"),
};

// Payment Gateways
export const paymentGatewayAPI = {
  list: () => api.get("/finance/payment-gateways/"),
  get: (id: string) => api.get(`/finance/payment-gateways/${id}/`),
  create: (data: Record<string, unknown>) =>
    api.post("/finance/payment-gateways/", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/finance/payment-gateways/${id}/`, data),
  patch: (id: string, data: Record<string, unknown>) =>
    api.patch(`/finance/payment-gateways/${id}/`, data),
  delete: (id: string) => api.delete(`/finance/payment-gateways/${id}/`),
  toggle: (id: string) =>
    api.post(`/finance/payment-gateways/${id}/toggle/`),
  providers: () => api.get("/finance/payment-gateways/providers/"),
};
