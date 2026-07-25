import { isRTL } from '@/utils/rtlUtils';

export default async function RootLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode; 
  params: Promise<{ locale?: string }>; // Made locale optional
}) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || 'en'; // Fallback to default locale
  const rtl = isRTL(locale);

  return (
    <html lang={locale} dir={rtl ? 'rtl' : 'ltr'}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}