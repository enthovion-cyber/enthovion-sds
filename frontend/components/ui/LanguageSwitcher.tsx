'use client';
import { useLocale } from '@/hooks/useLocale';

export default function LanguageSwitcher() {
  const { locale, switchLocale } = useLocale();
  return (
    <button
      onClick={() => switchLocale(locale === 'en' ? 'ar' : 'en')}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
      title="Switch language"
    >
      <span className="text-base">{locale === 'en' ? '🇸🇦' : '🇬🇧'}</span>
      <span className="text-gray-700">{locale === 'en' ? 'العربية' : 'English'}</span>
    </button>
  );
}
