import axios from 'axios';

const api = axios.create({
  baseURL: `${window.location.protocol}//${window.location.hostname}:5000/api`, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include token (if using sessions/JWT)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

export const getStats = () => api.get('/stats');
export const getDashboard = () => api.get('/stats/dashboard');
export const web3Login = (address, signature) => api.post('/auth/web3-login', { address, signature });
export const checkAuth = () => api.get('/auth/check');
export const logoutUser = () => {
    localStorage.removeItem('token');
    return Promise.resolve({ success: true });
};
export const getTrace = (code) => api.get(`/batches/trace/${code}`);
export const updateProfile = (data) => api.put('/auth/profile', data);
export const updatePassword = (data) => api.put('/auth/password', data);

// Product APIs
export const getProducts = () => api.get('/products');
export const addProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Batch APIs
export const getBatches = () => api.get('/batches');
export const addBatch = (data) => api.post('/batches', data);
export const updateBatch = (id, data) => api.put(`/batches/${id}`, data);
export const deleteBatch = (id) => api.delete(`/batches/${id}`);
export const addBatchProcess = (id, data) => api.post(`/batches/${id}/process`, data);
export const deleteBatchProcess = (id, processId) => api.delete(`/batches/${id}/process/${processId}`);
export const syncBatchBlockchain = (id, data) => api.put(`/batches/${id}/blockchain`, data);
export const sendContact = (data) => api.post('/contacts', data);

export default api;
