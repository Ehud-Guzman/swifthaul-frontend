import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_URL || ''}/api`;

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Bare client for public endpoints — never sends auth headers
const publicClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Attach access token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401 — single-flight so concurrent 401s share one refresh
let refreshPromise = null;

const refreshTokens = () => {
  if (!refreshPromise) {
    const refreshToken = localStorage.getItem('refreshToken');
    refreshPromise = axios
      .post(`${BASE_URL}/auth/refresh`, { refreshToken })
      .then(({ data }) => {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        return data.accessToken;
      })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry && localStorage.getItem('refreshToken')) {
      original._retry = true;
      try {
        const accessToken = await refreshTokens();
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// --- Auth ---
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  refresh: (data) => api.post('/auth/refresh', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// --- Users ---
export const usersApi = {
  getAll: (params) => api.get('/users', { params }),
  create: (data) => api.post('/users', data),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.patch(`/users/${id}`, data),
  remove: (id) => api.delete(`/users/${id}`),
};

// --- Vehicles ---
export const vehiclesApi = {
  getAll: (params) => api.get('/vehicles', { params }),
  getAvailable: () => api.get('/vehicles/available'),
  create: (data) => api.post('/vehicles', data),
  getById: (id) => api.get(`/vehicles/${id}`),
  update: (id, data) => api.patch(`/vehicles/${id}`, data),
  getJobs: (id) => api.get(`/vehicles/${id}/jobs`),
};

// --- Jobs ---
export const jobsApi = {
  getAll: (params) => api.get('/jobs', { params }),
  create: (data) => api.post('/jobs', data),
  getById: (id) => api.get(`/jobs/${id}`),
  assign: (id, data) => api.patch(`/jobs/${id}/assign`, data),
  reassign: (id, data) => api.patch(`/jobs/${id}/reassign`, data),
  updateStatus: (id, data) => api.patch(`/jobs/${id}/status`, data),
  cancel: (id, data) => api.patch(`/jobs/${id}/cancel`, data),
  getLogs: (id) => api.get(`/jobs/${id}/logs`),
};

// --- Pricing ---
export const pricingApi = {
  getAll: () => api.get('/pricing'),
  update: (vehicle_type, data) => api.put(`/pricing/${vehicle_type}`, data),
  estimate: (data) => api.post('/pricing/estimate', data),
};

// --- Analytics ---
export const analyticsApi = {
  overview: () => api.get('/analytics/overview'),
  jobs: (params) => api.get('/analytics/jobs', { params }),
  revenue: (params) => api.get('/analytics/revenue', { params }),
  vehicles: () => api.get('/analytics/vehicles'),
  drivers: () => api.get('/analytics/drivers'),
  owners: () => api.get('/analytics/owners'),
  exportJobs: (params) => api.get('/analytics/export/jobs', { params, responseType: 'blob' }),
  exportEarnings: () => api.get('/analytics/export/earnings', { responseType: 'blob' }),
};

// --- Public (no auth) ---
export const publicApi = {
  estimate: (data) => publicClient.post('/public/estimate', data),
  submitQuote: (data) => publicClient.post('/public/quote', data),
  track: (code) => publicClient.get(`/public/track/${encodeURIComponent(code)}`),
};

// --- Drivers ---
export const driversApi = {
  getAvailable: () => api.get('/drivers/available'),
};

// --- Notifications ---
export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

// --- Payouts ---
export const payoutsApi = {
  getAll: (params) => api.get('/payouts', { params }),
  create: (data) => api.post('/payouts', data),
  review: (id, data) => api.patch(`/payouts/${id}`, data),
  getSummary: () => api.get('/payouts/summary'),
};

// --- Disputes ---
export const disputesApi = {
  getAll: (params) => api.get('/disputes', { params }),
  create: (data) => api.post('/disputes', data),
  resolve: (id, data) => api.patch(`/disputes/${id}`, data),
};

// --- Earnings (driver) ---
export const earningsApi = {
  getDriverEarnings: (params) => api.get('/earnings/driver', { params }),
};

// --- Audit Log ---
export const auditLogApi = {
  getAll: (params) => api.get('/audit-log', { params }),
};

export default api;
