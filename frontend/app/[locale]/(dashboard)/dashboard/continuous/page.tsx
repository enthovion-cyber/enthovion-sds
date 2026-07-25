'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShieldCheck, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';
import Card from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import complianceService from '@/services/complianceService';
import { useLocale } from '@/hooks/useLocale';

const STATUS_META: Record<string, { label: string; icon: any; className: string }> = {
  compliant: { label: 'Compliant', icon: ShieldCheck, className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  risk: { label: 'Risk', icon: AlertTriangle, className: 'bg-amber-50 text-amber-800 border-amber-200' },
  violations: { label: 'Violations', icon: XCircle, className: 'bg-red-50 text-red-800 border-red-200' },
};

function ContinuousComplianceContent() {
  const { locale } = useLocale();
  const searchParams = useSearchParams();
  const statusFilter = (searchParams.get('status') || '').toLowerCase();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    complianceService
      .getContinuousStatus()
      .then((r) => setData(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  const items = useMemo(() => {
    const all = data?.items || [];
    if (!statusFilter) return all;
    return all.filter((i: any) => String(i.status || '').toLowerCase() === statusFilter);
  }, [data, statusFilter]);

  if (loading && !data) return <PageSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Continuous compliance</h1>
          <p className="text-sm text-gray-500 mt-0.5">Live library scan results with fix suggestions</p>
        </div>
        <div className="flex gap-2 text-sm">
          {(['compliant', 'risk', 'violations'] as const).map((k) => {
            const meta = STATUS_META[k];
            const active = statusFilter === k;
            const Icon = meta.icon;
            return (
              <Link
                key={k}
                href={`/${locale}/dashboard/continuous?status=${k}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${active ? meta.className : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
              >
                <Icon size={13} />
                {meta.label}
                <span className="opacity-70">
                  ({data?.summary?.[k] ?? 0})
                </span>
              </Link>
            );
          })}
          <Link
            href={`/${locale}/dashboard/continuous`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${!statusFilter ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
          >
            All ({data?.summary?.total ?? 0})
          </Link>
        </div>
      </div>

      <Card>
        {!items.length ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-sm font-medium">No items in this category</p>
            <p className="text-xs mt-1">Try a different filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 whitespace-nowrap">Chemical</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 whitespace-nowrap">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 whitespace-nowrap">Score</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 whitespace-nowrap">Conflicts</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 whitespace-nowrap">Fix suggestions</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 whitespace-nowrap"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((row: any) => {
                  const meta = STATUS_META[row.status] || STATUS_META.risk;
                  const Icon = meta.icon;
                  return (
                    <tr key={row.sds_id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <Link href={`/${locale}/sds/${row.sds_id}`} className="font-medium text-gray-900 hover:text-gray-700 block max-w-xs truncate">
                          {row.chemical_name || 'Unknown'}
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{row.jurisdiction || '—'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-lg border ${meta.className}`}>
                          <Icon size={12} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700 text-xs whitespace-nowrap">{row.score != null ? `${row.score}%` : '—'}</td>
                      <td className="py-3 px-4 text-gray-700 text-xs whitespace-nowrap">{row.conflicts?.length ?? 0}</td>
                      <td className="py-3 px-4 text-gray-700 text-xs whitespace-nowrap">{row.auto_fix_suggestions?.length ?? 0}</td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/${locale}/sds/${row.sds_id}`}
                          className="text-xs text-gray-600 hover:text-gray-900 font-medium inline-flex items-center gap-1"
                        >
                          Open <ExternalLink size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function ContinuousCompliancePage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <ContinuousComplianceContent />
    </Suspense>
  );
}