import { z } from 'zod';

// Şifre doğrulama şeması
export const passwordSchema = z
  .string()
  .min(8, 'Şifre en az 8 karakter olmalıdır')
  .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
  .regex(/[a-z]/, 'Şifre en az bir küçük harf içermelidir')
  .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir')
  .regex(/[^A-Za-z0-9]/, 'Şifre en az bir özel karakter içermelidir'); // Boş string de geçerli olsun

// E-posta doğrulama şeması
export const emailSchema = z
  .string()
  .email('Geçerli bir e-posta adresi giriniz');

// Doğrulama kodu şeması
export const verificationCodeSchema = z
  .string()
  .length(6, 'Kod 6 karakter olmalıdır')
  .regex(/^[0-9A-Z]+$/, 'Doğrulama kodu sadece rakam ve büyük harflerden oluşmalıdır');

// Doğrulama tipi şeması
export const verificationTypeSchema = z.enum([
  'EMAIL_VERIFY',
  'PASSWORD_RESET',
  'TWO_FACTOR',
  'PIN_VERIFY',
  'DEMO_REQUEST'
]);

// Giriş şeması
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema.or(z.literal('')),
  code: verificationCodeSchema.optional(),
  rememberMe: z.coerce.boolean().default(false).optional(),
}).refine((data) => {
  // Ya password ya da code olmalı, ikisi birden gerekli değil
  return (data.password || data.code);
}, {
  message: "şifre veya doğrulama kodu alanlarından birini giriniz",
  path: ["code"]
});

// Kayıt şeması
export const registerSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Şifre tekrarı gerekli'),
  role: z.string().default('USER'),
  verificationCode: verificationCodeSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

// Şifre sıfırlama şeması
export const resetPasswordSchema = z.object({
  code: z.string(),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Şifre tekrarı gerekli'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

// Şifre sıfırlama isteği şeması
export const forgotPasswordSchema = z.object({
  email: emailSchema
});


// Doğrulama kodu gönderme şeması
export const sendVerificationSchema = z.object({
  email: emailSchema,
  type: verificationTypeSchema,
});

// Doğrulama kodu doğrulama şeması
export const verifyCodeSchema = z.object({
  email: emailSchema,
  code: verificationCodeSchema,
  type: verificationTypeSchema,
});

export const passwordResetRequestSchema = z.object({
  email: emailSchema
});

export const passwordResetSchema = z.object({
  code: z.string(),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Şifre tekrarı gerekli'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});