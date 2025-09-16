import axios from 'axios';
import { processApiResponse } from '@/lib/utils/api';
import { captchaService } from './captcha';

// API temel URL'i
const API_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:3000/api';

// Axios instance oluştur
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor - her istekte token ve captcha ekle
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Her zaman her iki token'ı da ekle
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (accessToken) {
        config.headers['x-auth-token'] = accessToken;
      }
      if (refreshToken) {
        config.headers['x-refresh-token'] = refreshToken;
      }

      // Captcha token'ı al ve ekle
      const action = (config.url.split('/').pop() || 'general')
        .replace(/[^A-Za-z0-9_]/g, '_')
        .toLowerCase();
      const captchaToken = await captchaService.getToken(action);
      if (!captchaToken) {
        return Promise.reject(new Error('Captcha token alınamadı'));
      }
      config.headers['x-captcha-token'] = captchaToken;

      return Promise.resolve(config);
    } catch (error) {
      console.error('Request interceptor hatası:', error);
      return Promise.resolve(config);
    }
  },
  (error) => Promise.reject(error)
);

// Response interceptor - token yenileme ve hata yönetimi
axiosInstance.interceptors.response.use(
  (response) => {
    // Response header'larında yeni tokenlar var mı kontrol et
    const newAccessToken = response.headers['x-new-access-token'];
    const newRefreshToken = response.headers['x-new-refresh-token'];

    // Yeni tokenlar varsa storage'a kaydet
    if (newAccessToken) {
      localStorage.setItem('accessToken', newAccessToken);
    }
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }

    return response;
  },
  async (error) => {
    // 401 hatası durumunda direkt login'e yönlendir
    if ([401, 403].includes(error.response?.status)) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

async function handleApiCall(apiCall, options = {}) {
  const { maxRetries = 0, retryDelay = 1000 } = options;
  let retryCount = 0;

  const executeWithRetry = async () => {
    try {
      const response = await apiCall();
      return processApiResponse(response.data, options);
    } catch (error) {
      // Yeniden deneme mantığı
      if (retryCount < maxRetries) {
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return executeWithRetry();
      }
      throw error;
    }
  };

  return executeWithRetry();
}

// API metodları
const api = {
  get: (url, options = {}) => handleApiCall(() => axiosInstance.get(url), options),
  post: (url, data, options = {}) => handleApiCall(() => axiosInstance.post(url, data), options),
  put: (url, data, options = {}) => handleApiCall(() => axiosInstance.put(url, data), options),
  patch: (url, data, options = {}) => handleApiCall(() => axiosInstance.patch(url, data), options),
  delete: (url, options = {}) => handleApiCall(() => axiosInstance.delete(url), options),
};

export default api;