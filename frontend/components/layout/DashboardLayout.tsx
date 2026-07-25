'use client';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuthStore } from '@/store/authStore';
import { useLocale } from '@/hooks/useLocale';

export default function DashboardLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const { initFromStorage } = useAuthStore();
  const { isRTL } = useLocale();

  useEffect(() => { initFromStorage(); }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className={isRTL ? 'mr-64' : 'ml-64'}>
        <Navbar title={title} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
