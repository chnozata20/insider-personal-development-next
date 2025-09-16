import api from './api';

export const productService = {
  // Ürün listesi
  getProducts: async ({ page = 1, limit = 10, search, status, sortBy } = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status && { status }),
      ...(sortBy && { sortBy }),
    });

    const response = await api.get(`products?${params}`);
    return response;
  },

  // Ürün detayı
  getProduct: async (id) => {
    const response = await api.get(`products/${id}`);
    return response;
  },

  // Yeni ürün ekleme
  createProduct: async (data) => {
    const response = await api.post('products', data);
    return response;
  },

  // Ürün güncelleme
  updateProduct: async (id, data) => {
    const response = await api.patch(`products/${id}`, data);
    return response;
  },

  // Ürün silme
  deleteProduct: async (id) => {
    const response = await api.delete(`products/${id}`);
    return response;
  },

  // Ürünün atanan kullanıcılarını getirme
  getProductUsers: async (productId, { page = 1, limit = 10 } = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await api.get(`products/${productId}/users?${params}`);
    return response;
  },
};