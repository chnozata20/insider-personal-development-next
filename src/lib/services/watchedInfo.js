import api from './api';

export const watchedInfoService = {
  // Kullanıcının tüm izlenen bilgilerini getirme
  getWatchedInfos: async (userId, productId = null) => {
    const params = new URLSearchParams({
      userId
    });

    if (productId) {
      params.append('productId', productId);
    }

    const response = await api.get(`watched-info?${params}`);
    return response;
  },

  // Yeni izlenen bilgi ekleme
  createWatchedInfo: async (data) => {
    const response = await api.post('watched-info', data);
    return response;
  },

  // İzlenen bilgi güncelleme
  updateWatchedInfo: async (id, data) => {
    const response = await api.patch(`watched-info/${id}`, data);
    return response;
  },

  // İzlenen bilgi silme (soft delete)
  deleteWatchedInfo: async (id) => {
    const response = await api.delete(`watched-info/${id}`);
    return response;
  },
}; 