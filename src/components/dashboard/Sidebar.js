'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Monitor,
  BookOpen,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { decodeToken } from '@/lib/utils/token';
import Image from 'next/image';

const menuItems = [
  {
    title: 'dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN']
  },
  {
    title: 'users',
    href: '/users',
    icon: Users,
    roles: ['ADMIN']
  },
  {
    title: 'products',
    href: '/products',
    icon: Package,
    roles: ['ADMIN']
  },
  {
    title: 'contacts',
    href: '/contacts',
    icon: MessageCircle,
    roles: ['ADMIN']
  },
  {
    title: 'internetMonitoring',
    href: '/internetMonitoring/[userId]',
    icon: Monitor,
    roles: ['ADMIN', 'USER', 'DEMO_USER']
  },
  {
    title: 'educationCenter',
    href: '/educationCenter',
    icon: BookOpen,
    roles: ['ADMIN', 'USER', 'DEMO_USER'],
    disabled: true

  },
  {
    title: 'settings',
    href: '/settings',
    icon: Settings,
    roles: ['ADMIN', 'USER', 'DEMO_USER'],
    disabled: true
  },
  {
    title: 'contact',
    href: '/contact',
    icon: MessageCircle,
    roles: ['ADMIN', 'USER', 'DEMO_USER'],
  }
];

export default function Sidebar({ isMobileMenuOpen, onMobileMenuClose, onMobileMenuOpen }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { language } = useLanguage();
  const t = translations[language];
  const [user, setUser] = useState('USER');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded = decodeToken(token);
        setUser(decoded);
      } catch (error) {
        console.error('Token decode error:', error);
      }
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Kapalı sidebar için sol çentik */}
      {!isMobileMenuOpen && (
        <div 
          className="fixed left-0 top-1/2 z-50 -translate-y-1/2 md:hidden"
          onClick={onMobileMenuOpen}
        >
          <div className="group flex h-24 w-12 items-center justify-center rounded-r-xl bg-primary/20 hover:bg-primary/30 cursor-pointer transition-all duration-200 shadow-lg">
            <ChevronRight className="h-8 w-8 text-primary/80 group-hover:text-primary transition-colors" />
          </div>
        </div>
      )}

      {/* Açık sidebar için sağ çentik */}
      {isMobileMenuOpen && (
        <div
          className="fixed right-0 top-1/2 z-50 -translate-y-1/2 md:hidden"
          onClick={onMobileMenuClose}
        >
          <div className="group flex h-24 w-12 items-center justify-center rounded-l-xl bg-primary/20 hover:bg-primary/30 cursor-pointer transition-all duration-200 shadow-lg">
            <ChevronLeft className="h-8 w-8 text-primary/80 group-hover:text-primary transition-colors" />
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex h-screen flex-col border-r bg-background transition-all duration-300 md:relative',
          isCollapsed ? 'w-16' : 'w-64',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex h-14 items-center justify-center">
          <Link
            href="/dashboard"
            className={cn(
              'hidden items-center gap-2 font-semibold md:flex',
              isCollapsed && 'justify-center'
            )}
          >
            <div className="flex items-center px-2">
              <Image src={isCollapsed ? "/perseusdefend-logo-collapse.png" : "/perseusdefend-logo.png"} alt="Perseus Defend" height={100} width={100} />
            </div>
          </Link>
        </div>
        <nav className="space-y-1 p-2">
          {menuItems
            .filter(item => item.roles.includes(user.role))
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href.replace('[userId]', user.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground',
                    isCollapsed && 'justify-center px-0',
                    item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
                  )}
                  title={isCollapsed ? t[item.title] : undefined}
                  onClick={onMobileMenuClose}
                >
                  <item.icon className={cn('h-5 w-5', isCollapsed && 'h-7 w-7')} />
                  {!isCollapsed && <span>{t[item.title]}</span>}
                </Link>
              );
            })}
        </nav>
        <div className="p-2">
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start gap-3 px-2',
              isCollapsed && 'justify-center px-0'
            )}
            onClick={() => {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              window.location.href = '/login';
            }}
            title={isCollapsed ? t.logout : undefined}
          >
            <LogOut className={cn('h-7 w-7', isCollapsed && 'h-7 w-7')} />
            {!isCollapsed && <span>{t.logout}</span>}
          </Button>
        </div>

        {/* Collapse butonu */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'absolute -right-3 top-20 hidden h-6 w-6 rounded-full border bg-background shadow-md hover:bg-accent md:flex',
            isCollapsed && 'rotate-180'
          )}
          onClick={toggleSidebar}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </aside>

      {/* Mobil menü overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onMobileMenuClose}
        />
      )}
    </>
  );
} 