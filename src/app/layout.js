import { Inter } from 'next/font/google';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from 'sonner';
import AuthCheck from '@/components/AuthCheck';
import '@/app/globals.css';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Perseus Defend',
  description: 'Perseus Defend - Güvenlik Çözümleri',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          async
          defer
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <AuthCheck>
              {children}
            </AuthCheck>
            <Toaster
              position="top-right"
              theme="light"
              richColors
              toastOptions={{
                style: { background: '#3d498e', color: 'white', border: 'none' },
                className: 'rounded-lg shadow-lg'
              }}
            />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
