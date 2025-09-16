import crypto from 'crypto';
import { ValidationError } from './error';

// Sabit değerler
const PIN_LENGTH = 6;
const PIN_EXPIRY = 24 * 60 * 60 * 1000; // 24 saat

// PIN kodu oluşturma
export const generatePinCode = () => {
  try {
    return crypto.randomInt(100000, 999999).toString();
  } catch (error) {
    throw new ValidationError('PIN kodu oluşturulamadı');
  }
};

// PIN kodu süresini kontrol etme
export const isPinCodeExpired = (createdAt) => {
  try {
    const now = new Date();
    const codeAge = now.getTime() - new Date(createdAt).getTime();
    return codeAge > PIN_EXPIRY;
  } catch (error) {
    throw new ValidationError('PIN kodu süresi kontrol edilemedi');
  }
};

// PIN kodu formatını kontrol etme
export const isValidPinFormat = (pin) => {
  try {
    return new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin);
  } catch (error) {
    throw new ValidationError('PIN kodu formatı kontrol edilemedi');
  }
}; 