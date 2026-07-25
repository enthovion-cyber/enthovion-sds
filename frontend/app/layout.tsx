// app/[locale]/layout.tsx
import { Toaster } from 'react-hot-toast';
import { isRTL } from '@/utils/rtlUtils';
import '@/app/globals.css';

// 1. Tell Next.js which locales to pre-render
export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // 2. Await the params (Required for Next.js 15)
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const rtl = isRTL(locale);

  return (
    // 3. suppressHydrationWarning is essential when modifying <html> attributes
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