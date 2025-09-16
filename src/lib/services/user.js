import api from './api';

export const userService = {
  // Kullanıcı listesi
  getUsers: async ({ page = 1, limit = 10, search = '', role = '', status = '', sortBy = '' } = {}) => {
    const params = new URLSearchParams();

    // Sayfalama parametreleri
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    // Filtreleme parametreleri
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    if (status) params.append('status', status);
    if (sortBy) params.append('sortBy', sortBy);

    const response = await api.get(`users?${params.toString()}`);
    return response;
  },

  // Kullanıcı detayı
  getUser: async (id) => {
    const response = await api.get(`users/${id}`);
    return response;
  },

  // Yeni kullanıcı ekleme
  createUser: async (data) => {
    const response = await api.post('users', data);
    return response;
  },

  // Kullanıcı güncelleme
  updateUser: async (id, data) => {
    const response = await api.patch(`users/${id}`, data);
    return response;
  },

  // Kullanıcı silme
  deleteUser: async (id) => {
    const response = await api.delete(`users/${id}`);
    return response;
  },

  // Kullanıcının atanan ürünlerini getirme
  getUserProducts: async (userId, { page = 1, limit = 10 } = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await api.get(`users/${userId}/products?${params}`);
    return response;
  },

  // Kullanıcıya ürün atama
  assignProduct: async (userId, productId) => {
    const response = await api.post(`users/${userId}/assign-product`, { productId });
    return response;
  },

  // Kullanıcıdan ürün kaldırma
  removeProduct: async (userId, productId) => {
    const response = await api.delete(`users/${userId}/assign-product?productId=${productId}`);
    return response;
  },
}; 