import { z } from 'zod';

// Temel ürün şeması
export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Ürün adı zorunludur'),
  description: z.string().min(1, 'Ürün açıklaması zorunludur'),
  features: z.array(z.string()),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// InfoType şeması
const infoTypeSchema = z.object({
  infoType: z.string().min(1, 'InfoType adı zorunludur'),
  maxCount: z.number().min(1, 'Maksimum sayı en az 1 olmalıdır'),
});

// Yeni ürün oluşturma şeması
export const productCreateSchema = z.object({
  name: z.string().min(1, 'Ürün adı zorunludur'),
  description: z.string().min(1, 'Ürün açıklaması zorunludur'),
  features: z.array(z.string()).optional().default([]),
  isActive: z.boolean().default(true),
  infoTypes: z.array(infoTypeSchema).optional().default([]),
});

// Ürün güncelleme şeması
export const productUpdateSchema = z.object({
  name: z.string().min(1, 'Ürün adı zorunludur').optional(),
  description: z.string().min(1, 'Ürün açıklaması zorunludur').optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  infoTypes: z.array(infoTypeSchema).optional(),
}); 