import axios from 'axios';
import { getAccessToken, setAccessToken, clearAccessToken } from 'features/auth/services/authToken'

const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';
const api = axios.create({ baseURL: apiBase, headers: { 'Content-Type': 'application/json' }, timeout: 10000, withCredentials: true });
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use((response) => response, async (error) => {
  const original = error.config;
  if (error.response?.status === 401 && !original?._retry && !original?.url?.includes('/auth/refresh')) {
    original._retry = true;
    try {
      const { data } = await axios.post(`${apiBase}/auth/refresh`, {}, { withCredentials: true });
      setAccessToken(data.data.accessToken); original.headers.Authorization = `Bearer ${data.data.accessToken}`;
      return api(original);
    } catch { clearAccessToken(); window.location.href = '/login'; }
  }
  return Promise.reject(error);
});
export default api;

