import { isRTL } from '@/utils/rtlUtils';

// 1. Make the function async
export default async function LocaleLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode; 
  params: Promise<{ locale: string }> // 2. Define params as a Promise
}) {
  // 3. Await the params
  const { locale } = await params;
  const rtl = isRTL(locale);

  return (
    <html lang={locale} dir={rtl ? 'rtl' : 'ltr'}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}