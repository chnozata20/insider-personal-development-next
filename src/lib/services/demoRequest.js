import api from './api';

export const demoRequestService = {
  // Demo talep oluştur
  create: async (data) => {
    const response = await api.post('/demo-requests', data);
    return response.data;
  },

  // Demo talepleri listele (Admin)
  list: async () => {
    const response = await api.get('/admin/demo-requests');
    return response.data;
  },

  // Demo talep detayı (Admin)
  getById: async (id) => {
    const response = await api.get(`/admin/demo-requests/${id}`);
    return response.data;
  },

  // Demo talep durumu güncelle (Admin)
  updateStatus: async (id, data) => {
    const response = await api.patch(`/admin/demo-requests/${id}`, data);
    return response.data;
  },

  // Demo talep sil (Admin)
  delete: async (id) => {
    const response = await api.delete(`/admin/demo-requests/${id}`);
    return response.data;
  },
};