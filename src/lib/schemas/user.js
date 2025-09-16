import { z } from 'zod';
import { passwordSchema, emailSchema } from './auth';

export const userCreateSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['USER', 'ADMIN', 'DEMO_USER']),
  isActive: z.boolean(),
  twoFactorEnabled: z.boolean().optional().default(false)
});

export const userUpdateSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  email: emailSchema,
  role: z.enum(['USER', 'ADMIN', 'DEMO_USER']),
  isActive: z.boolean(),
  twoFactorEnabled: z.boolean().optional().default(false),
  newPassword: passwordSchema.optional()
});