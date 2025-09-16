import { z } from 'zod';

// Yeni izlenen bilgi oluşturma şeması
export const watchedInfoCreateSchema = z.object({
  type: z.string().min(1, 'Bilgi türü zorunludur'),
  value: z.string().min(1, 'Değer zorunludur'),
  userId: z.string().min(1, 'Kullanıcı ID\'si zorunludur'),
  productId: z.string().min(1, 'Ürün ID\'si zorunludur'),
});

// İzlenen bilgi güncelleme şeması
export const watchedInfoUpdateSchema = z.object({
  value: z.string().min(1, 'Değer zorunludur').optional(),
  productId: z.string().min(1, 'Ürün ID\'si zorunludur').optional(),
});