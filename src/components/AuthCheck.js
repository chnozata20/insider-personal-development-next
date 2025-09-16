'use client';

import { useRouter, usePathname } from 'next/navigation';
import { PAGE_CONFIG } from '@/config/page-config';
import { decodeToken } from '@/lib/utils/token';
import { authService } from '@/lib/services/auth';
import { useState, useCallback, useEffect } from 'react';

export default function AuthCheck({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [content, setContent] = useState(null);

  useEffect(() => {
    // Public sayfa kontrolü
    if (PAGE_CONFIG.public.includes(pathname)) {
      setContent(children);
      return;
    }

    // Token'ları localStorage'dan al
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    // Token kontrolü
    if (!accessToken || !refreshToken) {
      authService.logout();
      return null;
    }

    // Token'ların geçerliliğini kontrol et
    const decodedAccessToken = decodeToken(accessToken);
    const decodedRefreshToken = decodeToken(refreshToken);

    if (!decodedAccessToken || !decodedRefreshToken) {
      authService.logout();
      return null;
    }

    // 2FA kontrolü
    if (decodedAccessToken.waitingFor2FA) {
      authService.logout();
      return null;
    }

    // Role bazlı yetkilendirme kontrolü
    let hasAccess = false;
    for (const [route, allowedRoles] of Object.entries(PAGE_CONFIG.roleBased)) {
      const routePattern = route.replace(/\[.*?\]/g, '[^/]+');
      const regex = new RegExp(`^${routePattern}$`);
      
      if (regex.test(pathname)) {
        if (allowedRoles.includes(decodedAccessToken.role)) {
          hasAccess = true;
          break;
        }
      }
    }

    // Özel yetkilendirme kontrolü
    for (const [route, checkFn] of Object.entries(PAGE_CONFIG.custom)) {
      const routePattern = route.replace(/\[.*?\]/g, '[^/]+');
      const regex = new RegExp(`^${routePattern}$`);
      if (regex.test(pathname)) {
        const params = {};
        const pathParts = pathname.split('/');
        const configParts = route.split('/');
        
        configParts.forEach((part, index) => {
          if (part.startsWith('[') && part.endsWith(']')) {
            const paramName = part.slice(1, -1);
            params[paramName] = pathParts[index];
          }
        });

        if (!checkFn(decodedAccessToken, params)) {
          return null;
        }
        hasAccess = true;
        break;
      }
    }

    if (!hasAccess) {
      authService.logout();
      return null;
    }

    setContent(children);
  }, [children, pathname]);

  return content;
}