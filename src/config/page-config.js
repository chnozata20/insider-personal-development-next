// Sayfa rotalarının yetkilendirme yapılandırması
export const PAGE_CONFIG = {
  // Public sayfalar (herhangi bir yetkilendirme gerektirmez)
  public: [
    '/login',
    //'/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/contact'
  ],

  // Role bazlı yetkilendirme gerektiren sayfalar
  roleBased: {
    '/dashboard': ['ADMIN', 'USER'],
    '/profile': ['ADMIN', 'USER'],
    '/products': ['ADMIN', 'USER'],
    '/products/create': ['ADMIN'],
    '/products/edit/[id]': ['ADMIN'],
    '/products/info/[id]': ['ADMIN', 'USER'],
    '/users': ['ADMIN'],
    '/users/create': ['ADMIN'],
    '/users/edit/[id]': ['ADMIN'],
    '/settings': ['ADMIN'],
    '/analytics': ['ADMIN', 'USER'],
    '/reports': ['ADMIN', 'USER'],
    '/register': ['ADMIN'],
    '/internetMonitoring': ['ADMIN'],
    '/contacts': ['ADMIN']
  },

  // Özel yetkilendirme gerektiren sayfalar
  custom: {
    '/users/info/[id]': (user, params) => {
      if (user.role === 'ADMIN') return true;

      return user.id === params.id;
    },
    '/internetMonitoring/[userId]': (user, params) => {
      if (user.role === 'ADMIN') return true;

      return user.id === params.userId;
    }
  },
};

// Sayfa rotasının yetkilendirme gereksinimlerini kontrol eden yardımcı fonksiyon
export function getRouteAuthConfig(pathname) {
  // Public sayfa kontrolü
  if (PAGE_CONFIG.public.includes(pathname)) {
    return { type: 'public' };
  }

  // Role bazlı yetkilendirme kontrolü
  for (const [route, roles] of Object.entries(PAGE_CONFIG.roleBased)) {
    const routePattern = route.replace(/\[.*?\]/g, '[^/]+');
    const regex = new RegExp(`^${routePattern}$`);
    if (regex.test(pathname)) {
      return { type: 'role', roles };
    }
  }

  // Özel yetkilendirme kontrolü
  for (const [route, checkFn] of Object.entries(PAGE_CONFIG.custom)) {
    const routePattern = route.replace(/\[.*?\]/g, '[^/]+');
    const regex = new RegExp(`^${routePattern}$`);
    if (regex.test(pathname)) {
      return { type: 'custom', checkFn };
    }
  }

  // Varsayılan olarak yetkilendirme gerektir
  return { type: 'role', roles: ['ADMIN'] };
} 