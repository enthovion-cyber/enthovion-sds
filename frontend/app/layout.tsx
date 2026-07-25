// app/[locale]/layout.tsx
import { Toaster } from 'react-hot-toast';
import { isRTL } from '@/utils/rtlUtils';
import '@/app/globals.css';

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  // FIX: Make locale optional so TypeScript satisfies Promise<{}>
  params: Promise<{ locale?: string }>; 
}) {
  const resolvedParams = await params;
  // Fallback to 'en' if locale is undefined at type-check time
  const locale = resolvedParams?.locale || 'en';
  const rtl = isRTL(locale);

  return (
    <html 
      lang={locale} 
      dir={rtl ? 'rtl' : 'ltr'} 
      suppressHydrationWarning
    >
      <body className="antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '8px', fontSize: '14px' },
          }}
        />
      </body>
    </html>
  );
}