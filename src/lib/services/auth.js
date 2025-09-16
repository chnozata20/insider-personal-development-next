import api from './api';

export const authService = {
  // Kullanıcı kaydı
  register: async (userData, options = {}) => {
    return api.post('/auth/register', userData, options);
  },

  // Kullanıcı girişi
  login: async (credentials, options = {}) => {
    
    const response = await api.post('/auth/login', credentials, options);
    const { accessToken, refreshToken, user } = response;

    // Token'ları ve oturum bilgilerini localStorage'a kaydet
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    return response;
  },

  // Kullanıcı çıkışı
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  },

  // Refresh token ile yeni access token alma
  refreshToken: async (options = {}) => {
    try {

      const response = await api.post('/auth/refresh', {}, options);
      const { accessToken } = response;

      // Yeni token'ları localStorage'a kaydet
      localStorage.setItem('accessToken', accessToken);

      return response;
    } catch (error) {
      // Refresh token geçersizse veya süresi dolmuşsa kullanıcıyı logout yap
      if (error.response?.status === 401) {
        authService.logout();
      }
      throw error;
    }
  },

  // Şifre sıfırlama isteği
  requestPasswordReset: async (email, options = {}) => {
    return api.post('/auth/reset-password/request', { email }, options);
  },

  // Şifre sıfırlama
  resetPassword: async (data, options = {}) => {
    return api.post('/auth/reset-password/reset', data, options);
  },
};