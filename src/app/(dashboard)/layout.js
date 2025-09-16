'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Footer } from '@/components/dashboard/Footer';

export default function DashboardLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        onMobileMenuOpen={() => setIsMobileMenuOpen(true)}
      />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-0 md:p-6 overflow-y-auto">{children}</main>
        <Footer />
      </div>
    </div>
  );
} 