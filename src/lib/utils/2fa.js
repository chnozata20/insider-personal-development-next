import crypto from 'crypto';
import { authenticator } from 'otplib';
import { ValidationError } from './error';
import { sendEmail } from './email';

// Sabit değerler
const TWO_MINUTES_IN_MS = 2 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_24_HOURS = 24 * 60 * 60 * 1000;

// 2FA kodu oluşturma
export const generate2FASecret = () => {
  try {
    return authenticator.generateSecret();
  } catch (error) {
    throw new ValidationError('2FA secret oluşturulamadı: ' + error.message);
  }
};

// 2FA kodu doğrulama
export const verify2FACode = (secret, token) => {
  try {
    return authenticator.verify({ token, secret });
  } catch (error) {
    throw new ValidationError('2FA kodu doğrulanamadı: ' + error.message);
  }
};

// 2FA kodu oluşturma (e-posta için)
export const generate2FACode = () => {
  try {
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + TWO_MINUTES_IN_MS);
    return { code, expiresAt };
  } catch (error) {
    throw new ValidationError('2FA kodu oluşturulamadı: ' + error.message);
  }
};

// 2FA kodu gönderme
export const send2FACode = async (email, code) => {
  try {
    const subject = '2FA Doğrulama Kodu';
    const html = `
      <h1>2FA Doğrulama Kodu</h1>
      <p>Doğrulama kodunuz: <strong>${code}</strong></p>
      <p>Bu kod ${TWO_MINUTES_IN_MS / (60 * 1000)} dakika süreyle geçerlidir.</p>
    `;

    await sendEmail({ to: email, subject, html });
  } catch (error) {
    throw new ValidationError('2FA kodu gönderilemedi: ' + error.message);
  }
};

// 2FA kodu süresini kontrol etme
export const is2FACodeExpired = (expiresAt) => {
  try {
    if (!expiresAt) return true;
    return new Date() > new Date(expiresAt);
  } catch (error) {
    throw new ValidationError('2FA kodu süresi kontrol edilemedi: ' + error.message);
  }
};

// 2FA deneme sayısını kontrol etme
export const check2FAAttempts = (failedAttempts) => {
  try {
    return failedAttempts >= MAX_FAILED_ATTEMPTS;
  } catch (error) {
    throw new ValidationError('2FA deneme sayısı kontrol edilemedi: ' + error.message);
  }
};

// 2FA kilitleme süresini kontrol etme
export const is2FALocked = (lockedUntil) => {
  try {
    if (!lockedUntil) return false;
    return new Date() < new Date(lockedUntil);
  } catch (error) {
    throw new ValidationError('2FA kilitleme durumu kontrol edilemedi: ' + error.message);
  }
};

// 2FA kilitleme süresini hesaplama
export const calculate2FALockTime = () => {
  try {
    const now = new Date();
    return new Date(now.getTime() + LOCK_DURATION_24_HOURS);
  } catch (error) {
    throw new ValidationError('2FA kilitleme süresi hesaplanamadı: ' + error.message);
  }
}; 