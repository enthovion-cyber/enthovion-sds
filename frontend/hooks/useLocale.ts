'use client';
import { useParams, useRouter } from 'next/navigation';
import { isRTL } from '@/utils/rtlUtils';

export const useLocale = () => {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'en';

  const switchLocale = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    const current = window.location.pathname;
    const withoutLocale = current.replace(`/${locale}`, '') || '/';
    router.push(`/${newLocale}${withoutLocale}` as any);
  };

  return { locale, isRTL: isRTL(locale), dir: isRTL(locale) ? 'rtl' : 'ltr', switchLocale };
};