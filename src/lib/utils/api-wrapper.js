import { verifyToken, generateAccessToken, generateRefreshToken, getUserFromToken } from './token';
import { getEndpointAuthConfig, API_CONFIG } from '@/config/api-config';
import { createErrorResponse } from './error';
import prisma from '@/lib/prisma';

// HTTP metodlarına göre hata mesajları
const METHOD_ERROR_MESSAGES = {
  GET: 'Bu içeriği görüntüleme yetkiniz bulunmuyor',
  POST: 'Bu içeriği oluşturma yetkiniz bulunmuyor',
  PUT: 'Bu içeriği güncelleme yetkiniz bulunmuyor',
  DELETE: 'Bu içeriği silme yetkiniz bulunmuyor',
  PATCH: 'Bu içeriği düzenleme yetkiniz bulunmuyor'
};

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function withAuth(handler) {
  return async (request, context) => {
    const pathname = request.nextUrl.pathname;
    const method = request.method;
    console.log('🔒 Auth Middleware - İstek yapılan path:', pathname, 'Method:', method);

    const authConfig = getEndpointAuthConfig(pathname, method);
    console.log('🔒 Auth Middleware - Endpoint auth config:', authConfig);

    // Public endpoint kontrolü
    if (authConfig.type === 'public') {
      console.log('🔒 Auth Middleware - Public endpoint, kontrol atlanıyor');
      return handler(request, context);
    }

    // Token kontrolü
    const refreshToken = request.headers.get('x-refresh-token');
    const accessToken = request.headers.get('x-auth-token');

    console.log('🔒 Auth Middleware - Token durumu:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken
    });

    if (!accessToken || !refreshToken) {
      console.log('🔒 Auth Middleware - Token eksik, yetkilendirme başarısız');
      return createErrorResponse('Yetkilendirme başarısız', 401);
    }

    try {
      // Token'ların geçerliliğini kontrol et
      const { expired: accessTokenExpired, decoded: decodedAccessToken } = verifyToken(accessToken);
      const { expired: refreshTokenExpired, decoded: decodedRefreshToken } = verifyToken(refreshToken);

      // Access token süresi dolmuş ama refresh token geçerli
      if (accessTokenExpired && !refreshTokenExpired) {
        console.log('🔒 Auth Middleware - Access token süresi dolmuş, yeni tokenlar oluşturuluyor');
        
        // Yeni tokenlar oluştur
        const newAccessToken = generateAccessToken(decodedRefreshToken);
        
        // Orijinal handler'ı çalıştır
        const response = await handler(request, context);
        
        // Yeni tokenları response header'ına ekle
        const headers = new Headers(response.headers);
        headers.set('x-new-access-token', newAccessToken);
        
        console.log('🔒 Auth Middleware - Yeni tokenlar oluşturuldu ve response header\'ına eklendi');
        
        // Response'u klonla ve body'sini koru
        const responseBody = await response.clone().text();
        
        return new Response(responseBody, {
          status: response.status,
          statusText: response.statusText,
          headers
        });
      }

      if (accessTokenExpired && refreshTokenExpired) {
        console.log('🔒 Auth Middleware - Tokenlar geçersiz veya süresi dolmuş');
        return createErrorResponse('Geçersiz veya süresi dolmuş token', 401);
      }

      // Token'lardaki kullanıcı bilgilerinin eşleştiğini kontrol et
      if (decodedAccessToken.id !== decodedRefreshToken.id) {
        console.log('🔒 Auth Middleware - Token bilgileri uyuşmuyor:', {
          accessTokenId: decodedAccessToken.id,
          refreshTokenId: decodedRefreshToken.id
        });
        return createErrorResponse('Token bilgileri uyuşmuyor', 401);
      }

      // 2FA kontrolü
      if (decodedAccessToken.waitingFor2FA) {
        console.log('🔒 Auth Middleware - 2FA doğrulaması gerekiyor');
        return createErrorResponse('2FA doğrulaması gerekiyor', 403);
      }

      // Role bazlı yetkilendirme kontrolü
      if (authConfig.type === 'role') {
        console.log('🔒 Auth Middleware - Role kontrolü:', {
          allowedRoles: authConfig.roles,
          userRole: decodedAccessToken.role,
          method
        });
        
        if (!authConfig.roles.includes(decodedAccessToken.role)) {
          console.log('🔒 Auth Middleware - Yetkisiz rol erişimi');
          return createErrorResponse(METHOD_ERROR_MESSAGES[method] || 'Bu işlem için yetkiniz bulunmuyor', 403);
        }
      }

      // Özel yetkilendirme kontrolü
      if (authConfig.type === 'custom') {
        const params = {};
        const pathParts = pathname.split('/');
        
        // Tüm özel rotaları kontrol et
        for (const [route, config] of Object.entries(API_CONFIG.custom)) {
          const routePattern = route.replace(/\[.*?\]/g, '[^/]+');
          const regex = new RegExp(`^${routePattern}$`);
          
          if (regex.test(pathname)) {
            const configParts = route.split('/');
            
            configParts.forEach((part, index) => {
              if (part.startsWith('[') && part.endsWith(']')) {
                const paramName = part.slice(1, -1);
                params[paramName] = pathParts[index];
              }
            });

            let body = null;

            if (['POST', 'PUT', 'PATCH'].includes(method)) {
              try {
                const clonedRequest = request.clone();
                body = await clonedRequest.json();
              } catch (error) {
                console.error('🔒 Auth Middleware - Body parse hatası:', error);
              }
            }

            console.log('🔒 Auth Middleware - Özel yetkilendirme kontrolü:', {
              route,
              params,
              pathParts,
              configParts,
              method,
              body
            });

            // Async fonksiyon kontrolü
            const searchParams = new URL(request.url).searchParams;
            const checkResult = await authConfig.checkFn(decodedAccessToken, params, method, body, searchParams);
            
            if (!checkResult) {
              console.log('🔒 Auth Middleware - Özel yetkilendirme başarısız');
              return createErrorResponse(METHOD_ERROR_MESSAGES[method] || 'Bu işlem için yetkiniz bulunmuyor', 403);
            }
            
            // Yetkilendirme başarılı, döngüden çık
            break;
          }
        }
      }

      // Token bilgilerini request nesnesine ekle
      request.decodedAccessToken = decodedAccessToken;
      request.decodedRefreshToken = decodedRefreshToken;

      console.log('🔒 Auth Middleware - Yetkilendirme başarılı, istek işleniyor');
      return handler(request, context);
    } catch (error) {
      console.error('🔒 Auth Middleware - Hata:', error);
      return createErrorResponse(error.message || 'Bir hata oluştu', 401);
    }
  };
} 