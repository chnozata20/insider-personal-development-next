'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProductList } from '@/components/products/ProductList';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import { useRouter } from 'next/navigation';

export default function ProductsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="space-y-6 p-2">
      <ProductList/>
    </div>
  );
} 