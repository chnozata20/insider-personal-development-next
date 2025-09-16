'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import { getUserFromToken } from '@/lib/utils/token';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const t = translations[language];
  const [user, setUser] = useState(null);

  const getUser = useCallback(() => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      const userData = getUserFromToken(token);
      return userData;
    }
  }, []);

  useEffect(() => {
    setUser(getUser());
  }, [getUser]);

  return (
    <header className="flex justify-between items-center px-8 py-2 bg-background text-foreground border-b transition-colors">
      <div className="items-center gap-2 hidden md:flex">
        <span className="text-sm font-medium">
          {user?.name && `${t.welcome}, ${user.name.toUpperCase()}`}
        </span>
      </div>
      <div className="flex items-center space-x-4 ml-auto">
        <span className="text-sm text-gray-600">{t.language}</span>
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
      </div>
    </header>
  );
}