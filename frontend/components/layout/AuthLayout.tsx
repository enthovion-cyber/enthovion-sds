'use client';
import Link from 'next/link';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useLocale } from '@/hooks/useLocale';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        {/* Navigates to the user's localized homepage e.g. /en or /ar */}
        <Link href={`/${locale}` as any} className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">SafeSheet AI</span>
        </Link>
        <LanguageSwitcher />
      </header>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}