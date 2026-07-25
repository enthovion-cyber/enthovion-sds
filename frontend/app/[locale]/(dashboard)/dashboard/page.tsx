'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, ShieldCheck, Clock, TrendingUp, Wand2, Upload } from 'lucide-react';
import { useSds } from '@/hooks/useSds';
import { useLocale } from '@/hooks/useLocale';
import { useAuthStore } from '@/store/authStore';
import SdsLibraryTable from '@/components/sds/SdsLibraryTable';
import Button from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import complianceService from '@/services/complianceService';

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  href,
}: {
  label: string;
  value: number | string;
  icon: any;
  color: string;
  href?: string;
}) {
  const content = (
    <div className={`bg-white border border-gray-200 rounded-xl p-5 ${href ? 'hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer' : ''}`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
        <Icon size={16} className="text-white" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
      {href && <p className="text-[11px] text-gray-400 mt-2">View details →</p>}
    </div>
  );

  return href ? <Link href={href as any}>{content}</Link> : content;
}

export default function DashboardPage() {
  const { list, stats, isLoading, fetchAll, fetchStats } = useSds();
  const { locale } = useLocale();
  const user = useAuthStore((s) => s.user);
  const [continuous, setContinuous] = useState<any>(null);

  useEffect(() => {
    fetchAll({ limit: 5 });
    fetchStats();
    complianceService.getContinuousStatus()
      .then((r) => setContinuous(r.data.data))
      .catch(() => setContinuous(null));
  }, []);

  if (isLoading && !stats) return <PageSpinner />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Good to see you, {user?.name?.split(' ')[0] || 'there'}</h1>
        <p className="text-sm text-gray-500 mt-1">Here's your chemical safety library overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total SDS documents" value={stats?.total ?? '—'} icon={FileText} color="bg-gray-900" href={`/${locale}/sds`} />
        <StatCard label="Approved & published" value={stats?.approved ?? '—'} icon={ShieldCheck} color="bg-green-600" href={`/${locale}/sds`} />
        <StatCard label="Expiring within 30 days" value={stats?.expiringSoon ?? '—'} icon={Clock} color="bg-amber-500" href={`/${locale}/dashboard/expiring?days=30`} />
        <StatCard label="Avg compliance score" value={stats?.avgComplianceScore != null ? `${stats.avgComplianceScore}%` : '—'} icon={TrendingUp} color="bg-blue-600" href={`/${locale}/compliance`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Continuous: compliant" value={continuous?.summary?.compliant ?? '—'} icon={ShieldCheck} color="bg-emerald-600" href={`/${locale}/dashboard/continuous?status=compliant`} />
        <StatCard label="Continuous: risk" value={continuous?.summary?.risk ?? '—'} icon={Clock} color="bg-amber-600" href={`/${locale}/dashboard/continuous?status=risk`} />
        <StatCard label="Continuous: violations" value={continuous?.summary?.violations ?? '—'} icon={TrendingUp} color="bg-red-600" href={`/${locale}/dashboard/continuous?status=violations`} />
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mb-6">
        <Link href={`/${locale}/sds/generate` as any}>
          <Button leftIcon={<Wand2 size={14} />}>Generate SDS</Button>
        </Link>
        <Link href={`/${locale}/sds/upload` as any}>
          <Button variant="secondary" leftIcon={<Upload size={14} />}>Upload SDS</Button>
        </Link>
        <Link href={`/${locale}/compliance` as any}>
          <Button variant="outline" leftIcon={<ShieldCheck size={14} />}>Run compliance audit</Button>
        </Link>
      </div>

      {/* Recent SDS */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Recent SDS documents</h2>
          <Link href={`/${locale}/sds` as any} className="text-xs text-gray-500 hover:text-gray-900">View all →</Link>
        </div>
        <SdsLibraryTable items={list} locale={locale} />
      </div>
    </div>
  );
}