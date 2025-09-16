'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';

export function Footer() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <footer className="bg-muted text-muted-foreground text-center text-sm py-4 border-t transition-colors">
      <div className="mb-1">
        {t.termsOfUse} &nbsp; | &nbsp; {t.privacyPolicy} &nbsp; | &nbsp; {t.contact}
      </div>
      <div>
        {t.copyright}
      </div>
    </footer>
  );
} 