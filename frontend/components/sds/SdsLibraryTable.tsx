'use client';
import Link from 'next/link';
import { formatDate, getStatusBadgeClass, getComplianceBg } from '@/utils/formatters';
import type { SdsListItem } from '@/types/sds.types';

interface Props { items: SdsListItem[]; locale: string; }

export default function SdsLibraryTable({ items, locale }: Props) {
  if (!items.length) return (
    <div className="text-center py-16 text-gray-500">
      <p className="text-sm">No SDS documents found</p>
      <p className="text-xs mt-1">Generate or upload your first SDS to get started</p>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {['Chemical', 'CAS', 'Language', 'Status', 'Compliance', 'Updated', ''].map((h) => (
              <th key={h} className="text-left py-3 px-4 text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {items.map((sds) => (
            <tr key={sds.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4">
                <Link href={`/${locale}/sds/${sds.id}`} className="font-medium text-gray-900 hover:text-gray-700 block max-w-xs truncate">
                  {sds.chemicalName}
                </Link>
              </td>
              <td className="py-3 px-4 text-gray-500 text-xs">{sds.casNumber || '—'}</td>
              <td className="py-3 px-4 text-gray-500 uppercase text-xs">{sds.language}</td>
              <td className="py-3 px-4">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${getStatusBadgeClass(sds.status)}`}>
                  {sds.status === 'pending_review' ? 'Pending' : sds.status}
                </span>
              </td>
              <td className="py-3 px-4">
                {sds.complianceScore != null
                  ? <span className={`text-xs font-medium px-2 py-0.5 rounded ${getComplianceBg(sds.complianceScore)}`}>{sds.complianceScore}%</span>
                  : <span className="text-gray-400 text-xs">—</span>}
              </td>
              <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">{formatDate(sds.updatedAt)}</td>
              <td className="py-3 px-4">
                <Link href={`/${locale}/sds/${sds.id}`} className="text-xs text-gray-600 hover:text-gray-900 font-medium">View →</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
