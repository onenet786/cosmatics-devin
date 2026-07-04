import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  login: (email: string, password: string) => api.post("/v1/auth/login", { email, password }),
  me: () => api.get("/v1/auth/me"),
};

export const dashboardApi = {
  summary: () => api.get("/v1/reports/dashboard"),
};

export const inventoryApi = {
  items: () => api.get("/v1/inventory/items"),
  stockLevels: () => api.get("/v1/inventory/stock-levels"),
};

export const posApi = {
  sessions: () => api.get("/v1/pos/sessions"),
  transactions: () => api.get("/v1/pos/transactions"),
  returnRequests: () => api.get("/v1/pos/return-requests"),
};

export const approvalsApi = {
  pending: () => api.get("/v1/approvals/pending"),
  decide: (id: string, status: "APPROVED" | "REJECTED", reason?: string) =>
    api.patch(`/v1/approvals/${id}/decide`, { status, reason }),
};

export const purchaseSalesApi = {
  parties: () => api.get("/v1/purchase-sales/parties"),
  salesInvoices: () => api.get("/v1/purchase-sales/sales-invoices"),
  purchaseOrders: () => api.get("/v1/purchase-sales/purchase-orders"),
};
