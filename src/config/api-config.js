// API endpoint'leri için yetkilendirme konfigürasyonu
import { GET } from '@/app/api/products/route';
import prisma from '@/lib/prisma';

export const API_CONFIG = {
  // Public endpoint'ler (yetkilendirme gerektirmeyen)
  public: [
    '/api/auth/login',
    //'/api/auth/register',
    '/api/auth/refresh',
    '/api/auth/reset-password/',
    '/api/auth/reset-password/reset',
    '/api/auth/forgot-password',
    '/api/auth/verification/send',
    '/api/auth/verification/verify',
    '/api/contact',
  ],

  // Role bazlı yetkilendirme gerektiren endpoint'ler
  role: {
    // Ürün endpoint'leri
    '/api/products': {
      GET: ['ADMIN', 'USER', 'DEMO_USER'],
      POST: ['ADMIN'],
      PUT: ['ADMIN'],
      DELETE: ['ADMIN']
    },
    '/api/products/[id]': {
      GET: ['ADMIN', 'USER', 'DEMO_USER'],
      PUT: ['ADMIN'],
      DELETE: ['ADMIN']
    },
    '/api/products/[id]/users': {
      GET: ['ADMIN']
    },
    '/api/auth/register': {
      POST: ['ADMIN']
    },

    // Kullanıcı endpoint'leri
    '/api/users': {
      GET: ['ADMIN'],
      POST: ['ADMIN'],
      PUT: ['ADMIN'],
      DELETE: ['ADMIN']
    },
    '/api/users/[id]': {
      GET: ['ADMIN', 'USER'],
      PUT: ['ADMIN'],
      DELETE: ['ADMIN']
    },
    '/api/users/[id]/products': {
      GET: ['ADMIN', 'USER']
    },
    '/api/users/[id]/assign-product': {
      POST: ['ADMIN'],
      DELETE: ['ADMIN']
    },

    // Contact endpoint'leri (Admin)
    '/api/contacts': {
      GET: ['ADMIN']
    },
    '/api/contacts/[id]': {
      GET: ['ADMIN'],
      PATCH: ['ADMIN'],
      DELETE: ['ADMIN']
    },
    '/api/contact': {
      GET: ['ADMIN'],
      POST: ['ADMIN']
    },
    '/api/contact/[id]': {
      GET: ['ADMIN'],
      PATCH: ['ADMIN'],
      DELETE: ['ADMIN']
    }
  },

  // Özel yetkilendirme gerektiren endpoint'ler
  custom: {
    // Kendi profilini veya admin ise başka kullanıcıların profilini güncelleyebilir
    '/api/users/[id]': {
      type: 'custom',
      checkFn: (user, params, method) => {
        // Admin her kullanıcıyı görebilir ve düzenleyebilir
        if (user.role === 'ADMIN') return true;
        
        // Normal kullanıcılar sadece kendi profillerini görebilir
        if (method === 'GET') {
          return user.id === params.id;
        }
        
        // Normal kullanıcılar sadece kendi profillerini güncelleyebilir
        if (method === 'PUT') {
          return user.id === params.id;
        }

        return false;
      }
    },
    '/api/watched-info': {
      type: 'custom',
      checkFn: async (user, params, method, body, searchParams) => {
        if (user.role === 'ADMIN') return true;

        if (method === 'GET') {
          const userId = searchParams.get('userId');
          return user.id === userId;
        }

        if (method === 'POST') {
          return user.id === body.userId;
        }

        return false;
      }
    },
    '/api/watched-info/[id]': {
      type: 'custom',
      checkFn: async (user, params, method, body) => {
        if (user.role === 'ADMIN') return true;

        const watchedInfo = await prisma.watchedInfo.findFirst({
          where: {
            id: params.id,
            isActive: true
          }
        });

        return user.id === watchedInfo.userId;
      }
    },
    '/api/users/[id]/products': {
      type: 'custom',
      checkFn: async (user, params, method) => {
        // Admin her kullanıcının ürünlerini görebilir
        if (user.role === 'ADMIN') return true;
        
        // Normal kullanıcılar sadece kendi ürünlerini görebilir
        return user.id === params.id;
      }
    }
  },
};

// Endpoint'in yetkilendirme gereksinimlerini kontrol eden yardımcı fonksiyon
export function getEndpointAuthConfig(pathname, method = 'GET') {
  // Public endpoint kontrolü
  if (API_CONFIG.public.includes(pathname)) {
    return { type: 'public' };
  }

  // Role bazlı yetkilendirme kontrolü
  for (const [route, config] of Object.entries(API_CONFIG.role)) {
    const routePattern = route.replace(/\[.*?\]/g, '[^/]+');
    const regex = new RegExp(`^${routePattern}$`);
    if (regex.test(pathname)) {
      // HTTP metoduna göre yetkilendirme
      const methodConfig = config[method] || config['*'];
      if (methodConfig) {
        return { type: 'role', roles: methodConfig };
      }
    }
  }

  // Özel yetkilendirme kontrolü
  for (const [route, config] of Object.entries(API_CONFIG.custom)) {
    const routePattern = route.replace(/\[.*?\]/g, '[^/]+');
    const regex = new RegExp(`^${routePattern}$`);
    if (regex.test(pathname)) {
      return { ...config, method };
    }
  }

  // Varsayılan olarak yetkilendirme gerektir
  return { type: 'role', roles: ['ADMIN'] };
} 