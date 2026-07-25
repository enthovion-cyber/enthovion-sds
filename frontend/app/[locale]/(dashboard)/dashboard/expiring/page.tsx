'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Clock, FileText } from 'lucide-react';
import Card from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import sdsService from '@/services/sdsService';
import { useLocale } from '@/hooks/useLocale';
import { formatDate } from '@/utils/formatters';

export default function ExpiringSdsPage() {
  const { locale } = useLocale();
  const searchParams = useSearchParams();
  const days = Number.parseInt(searchParams.get('days') || '30', 10) || 30;

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    sdsService
      .getExpiring(days)
      .then((r) => setItems(r.data.data || []))
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Clock size={18} /> Expiring SDS
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Documents expiring within {days} days</p>
        </div>
        <Link href={`/${locale}/sds`} className="text-sm text-gray-600 hover:text-gray-900">
          View SDS library →
        </Link>
      </div>

      <Card>
        {!items.length ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-sm font-medium">No expiring documents</p>
            <p className="text-xs mt-1">Nothing is due for review in the next {days} days.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((sds) => (
              <Link
                key={sds.id}
                href={`/${locale}/sds/${sds.id}`}
                className="block border border-gray-200 rounded-xl p-4 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate flex items-center gap-2">
                      <FileText size={14} className="text-gray-500" />
                      {sds.chemical_name || sds.chemicalName || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {sds.expires_at ? `Review by: ${formatDate(sds.expires_at)}` : 'No expiry date'}
                    </p>
                  </div>
                  {sds.compliance_score != null && (
                    <span className="text-xs font-medium px-2 py-1 rounded-lg bg-gray-100 text-gray-700 flex-shrink-0">
                      {sds.compliance_score}%
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

