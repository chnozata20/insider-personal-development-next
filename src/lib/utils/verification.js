import { randomBytes } from 'crypto';

export function generateVerificationCode() {
  // 6 haneli, sadece rakam ve büyük harflerden oluşan kod
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const bytes = randomBytes(6);
  let code = '';

  for (let i = 0; i < 6; i++) {
    const index = bytes[i] % chars.length;
    code += chars[index];
  }

  return code;
} 