import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
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
  exportJobs: () => api.get('/analytics/export/jobs', { responseType: 'blob' }),
  exportEarnings: () => api.get('/analytics/export/earnings', { responseType: 'blob' }),
};

// --- Public (no auth) ---
export const publicApi = {
  estimate: (data) => api.post('/public/estimate', data),
  submitQuote: (data) => api.post('/public/quote', data),
  track: (id) => api.get(`/public/track/${id}`),
};

// --- Notifications ---
export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export default api;
