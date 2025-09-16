import api from './api';

export const verificationService = {
  // Doğrulama kodu gönder
  sendCode: async (data, options = {}) => {
    return api.post('/auth/verification/send', data, options);
  },

  // Doğrulama kodunu doğrula
  verifyCode: async (data, options = {}) => {
    return api.post('/auth/verification/verify', data, options);
  }
}; 