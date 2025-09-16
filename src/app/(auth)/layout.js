'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations/index';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AuthLayout({ children }) {
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const t = translations[language];
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground transition-colors">
      {/* Üst Bar */}
      <div className="flex justify-between items-start p-6">
        {/* Sol Logo Alanı */}
        <div className="flex items-center space-x-4">
          <img src="/perseusdefend-logo.png" alt="Perseus Defend" className="h-14" />
        </div>
        {/* Sağ Üst Menü */}
        <div className="flex items-center space-x-4 mt-2">
          <span className="text-sm text-gray-600">{t.language} </span>
          <select
            value={language}
            onChange={e => changeLanguage(e.target.value)}
            className="border rounded px-2 py-1 text-sm bg-background"
          >
            <option value="tr">Türkçe (Türkiye)</option>
            <option value="en">English (US)</option>
          </select>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-lg"
          >
            {theme === 'dark' ? '🌞' : '🌙'}
          </Button>
          {/*<span className="text-sm text-gray-500 italic">{t.firstTimeUser}</span>
          <Link href="/register" className="text-sm font-semibold text-blue-700 hover:underline">{t.register}</Link>*/}
        </div>
      </div>

      {/* Orta Giriş Kutusu */}
      <div className="flex flex-1 justify-center items-center">
        <div className="w-full max-w-md bg-card text-card-foreground border rounded shadow transition-colors">
          <h2 className="text-lg font-semibold text-white px-4 py-2 rounded-t mb-6 bg-perseusPrimary">
            {t.loginTitle}
          </h2>
          {children}
          <hr />
          <div className="flex justify-end m-2">
            {pathname === '/login' ? (
              <Link href="/forgot-password" className="text-sm text-cyan-600 hover:underline">
                {`» ${t.forgotPassword}`}
              </Link>
            ) : (
              <Link href="/login" className="text-sm text-cyan-600 hover:underline">
                {`» ${t.login}`}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted text-muted-foreground text-center text-sm py-4 border-t transition-colors">
        <div className="mb-1">
          {t.termsOfUse} &nbsp; | &nbsp; {t.privacyPolicy} &nbsp; | &nbsp; {t.contact}
        </div>
        <div>
          {t.copyright}
        </div>
      </footer>
    </div>
  );
} 