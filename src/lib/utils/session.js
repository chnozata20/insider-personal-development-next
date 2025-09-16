import { generateAccessToken, generateRefreshToken } from './token';
import { ValidationError } from './error';

// Oturum bilgilerini oluşturma
export function createSessionData(user, rememberMe = false) {
  try {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user, rememberMe);

    return {
      accessToken,
      refreshToken,
      user
    };
  } catch (error) {
    throw new ValidationError('Oturum bilgileri oluşturulamadı');
  }
} 