import DashboardCommandCenter from '@/components/dashboard/DashboardCommandCenter';
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />}>
      <DashboardCommandCenter />
    </Suspense>
  );
}
