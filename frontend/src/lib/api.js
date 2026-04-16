import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add auth token for admin requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token && config.url?.startsWith('/admin')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Products
export const getProducts = (params) => api.get('/products', { params });
export const getProductById = (id) => api.get(`/products/${id}`);
export const getCategories = () => api.get('/products/categories');

// Orders
export const placeOrder = (data) => api.post('/orders', data);
export const trackOrder = (params) => api.get('/orders/track', { params });

// Admin
export const adminLogin = (data) => api.post('/admin/login', data);
export const getAdminOrders = (params) => api.get('/admin/orders', { params });
export const updateOrderStatus = (id, status) => api.patch(`/admin/orders/${id}`, { status });
export const createProduct = (data) => api.post('/admin/products', data);
export const updateProduct = (id, data) => api.put(`/admin/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/admin/products/${id}`);
export const uploadImages = (formData) => api.post('/admin/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

export default api;
