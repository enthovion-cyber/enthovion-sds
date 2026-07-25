'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useAuthStore } from '@/store/authStore';
import userService from '@/services/userService';
import { useLocale } from '@/hooks/useLocale';

const buildNotificationHref = (locale: string, notification: any) => {
  const route = notification?.metadata?.route;
  if (typeof route === 'string' && route.length > 0) {
    return route.startsWith(`/${locale}/`) ? route : `/${locale}${route.startsWith('/') ? route : `/${route}`}`;
  }

  if (notification?.metadata?.task_id) {
    return `/${locale}/pipeline?taskId=${notification.metadata.task_id}`;
  }

  if (notification?.metadata?.sds_id) {
    return `/${locale}/sds/${notification.metadata.sds_id}`;
  }

  return `/${locale}/pipeline`;
};

export default function Navbar({ title }: { title?: string }) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const { locale } = useLocale();
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const visibleNotifications = useMemo(() => notifications.slice(0, 8), [notifications]);

  const loadNotifications = async () => {
    try {
      const [countRes, listRes] = await Promise.all([
        userService.getUnreadNotificationsCount(),
        userService.getNotifications(8),
      ]);
      setUnread(countRes.data.data?.unread || 0);
      setNotifications(listRes.data.data || []);
    } catch {
      setUnread(0);
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleNotificationClick = async (notification: any) => {
    try {
      if (!notification.read_at) {
        await userService.markNotificationRead(notification.id);
      }
    } catch {
      // Navigation should still work even if mark-read fails.
    }

    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notification.id ? { ...item, read_at: item.read_at || new Date().toISOString() } : item
      )
    );
    setUnread((prev) => Math.max(0, prev - (notification.read_at ? 0 : 1)));
    setOpen(false);
    router.push(buildNotificationHref(locale, notification) as any);
  };

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-20">
      <h1 className="text-sm font-semibold text-gray-800">{title || 'SafeSheet AI'}</h1>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <div className="relative">
          <button
            onClick={() => {
              const next = !open;
              setOpen(next);
              if (next) loadNotifications();
            }}
            className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell size={16} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] leading-4 text-center">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-96 max-w-[80vw] rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Notifications</p>
                <button onClick={() => setOpen(false)} className="text-xs text-gray-500 hover:text-gray-800">
                  Close
                </button>
              </div>
              {!visibleNotifications.length ? (
                <p className="px-4 py-6 text-sm text-gray-500">No notifications yet.</p>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {visibleNotifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full px-4 py-3 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notification.read_at ? 'bg-blue-50/40' : 'bg-white'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        </div>
                        {!notification.read_at && (
                          <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-blue-600 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
          <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <span className="text-sm text-gray-700 font-medium">{user?.name || 'User'}</span>
        </div>
      </div>
    </header>
  );
}