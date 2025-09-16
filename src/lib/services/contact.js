import api from './api';

export const contactService = {
  // Contact form gönder
  create: async (data, options = {}) => {
    const response = await api.post('/contact', data);
    return response;
  },

  // Contact mesajlarını listele (Admin)
  getContacts: async ({ page = 1, limit = 10, search, status, sortBy } = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status && { status }),
      ...(sortBy && { sortBy }),
    });

    const response = await api.get(`/contact?${params}`);
    return response;
  },

  // Contact mesaj detayı (Admin)
  getContact: async (id) => {
    const response = await api.get(`/contact/${id}`);
    return response;
  },

  // Contact mesaj durumu güncelle (Admin)
  updateContact: async (id, data) => {
    const response = await api.patch(`/contact/${id}`, data);
    return response;
  },

  // Contact mesaj sil (Admin)
  deleteContact: async (id) => {
    const response = await api.delete(`/contact/${id}`);
    return response;
  },
}; 