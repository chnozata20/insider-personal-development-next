import jwt from 'jsonwebtoken';
import { ValidationError, AuthenticationError } from './error';

const ACCESS_TOKEN_EXPIRES_IN = '1m';
const REFRESH_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN_REMEMBER_ME = '7d';

// JWT token oluşturma
const generateToken = (user, expiresIn) => {
  try {
    return jwt.sign(
      user,
      process.env.JWT_SECRET,
      { expiresIn }
    );
  } catch (error) {
    throw new ValidationError('Token oluşturulamadı');
  }
};

// JWT token doğrulama
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // JWT metadata'sını çıkar
    const { exp, iat, iss, sub, ...userData } = decoded;
    
    // Token'ın süresi dolmuş mu kontrol et
    if (isTokenExpired(decoded)) {
      return {
        expired: true,
        decoded: null,
      };
    }

    return {
      expired: false,
      decoded: userData,
    };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return {
        expired: true,
        decoded: null,
      };
    }
    if (error.name === 'JsonWebTokenError') {
      throw new AuthenticationError('Geçersiz token');
    }
    throw new ValidationError('Token doğrulanamadı');
  }
};

// Refresh token oluşturma
export const generateRefreshToken = (user, rememberMe = false) => {
  return generateToken(user, rememberMe ? REFRESH_TOKEN_EXPIRES_IN_REMEMBER_ME : REFRESH_TOKEN_EXPIRES_IN); // rememberMe true ise 7 gün, değilse 15 dakika
};

// Access token oluşturma
export const generateAccessToken = (user) => {
  return generateToken(user, ACCESS_TOKEN_EXPIRES_IN); // 15 dakika geçerli
};

// Token'dan kullanıcı bilgilerini çıkarma
export const getUserFromToken = (token) => {
  try {
    const decoded = jwt.decode(token);
    
    // JWT metadata'sını çıkar
    const { exp, iat, iss, sub, ...userData } = decoded;
    
    return userData;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Token süresi dolmuş');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new AuthenticationError('Geçersiz token');
    }
    throw new ValidationError('Kullanıcı bilgileri alınamadı');
  }
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};


// Token'ın süresinin dolup dolmadığını kontrol eden yardımcı fonksiyon
export const isTokenExpired = (decodedToken) => {
  if (!decodedToken || !decodedToken.exp) return true;
  
  // exp değeri saniye cinsinden olduğu için 1000 ile çarpıyoruz
  const expirationTime = decodedToken.exp * 1000;
  const currentTime = Date.now();
  
  return currentTime >= expirationTime;
};