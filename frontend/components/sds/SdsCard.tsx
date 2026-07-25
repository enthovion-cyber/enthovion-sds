'use client';
import { useState } from 'react';
import Link from 'next/link';
import { FileText, Download, ShieldCheck, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatDate, getDaysUntilExpiry, getComplianceBg, getStatusBadgeClass } from '@/utils/formatters';
import type { SdsListItem } from '@/types/sds.types';

interface Props { sds: SdsListItem; locale: string; onExport?: (id: string, name: string) => void; onAudit?: (id: string) => void; }

export default function SdsCard({ sds, locale, onExport, onAudit }: Props) {
  const daysLeft = getDaysUntilExpiry(sds.expiresAt);
  const expiring = daysLeft !== null && daysLeft <= 30;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={16} className="text-gray-400 flex-shrink-0" />
          <div className="min-w-0">
            <Link href={`/${locale}/sds/${sds.id}`} className="text-sm font-semibold text-gray-900 hover:text-gray-700 truncate block">
              {sds.chemicalName}
            </Link>
            {sds.casNumber && <p className="text-xs text-gray-500">CAS: {sds.casNumber}</p>}
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded font-medium flex-shrink-0 ${getStatusBadgeClass(sds.status)}`}>
          {sds.status === 'pending_review' ? 'Pending' : sds.status}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
        <span className="uppercase font-medium">{sds.language}</span>
        <span>•</span>
        <span>{sds.jurisdiction?.replace('_', ' ')}</span>
        <span>•</span>
        <span>v{sds.version}</span>
        {expiring && daysLeft !== null && (
          <><span>•</span><span className="text-amber-600 font-medium flex items-center gap-1"><Clock size={10} />{daysLeft}d left</span></>
        )}
      </div>

      {sds.complianceScore != null && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Compliance</span>
            <span className={`text-xs font-semibold ${getComplianceBg(sds.complianceScore)} px-1.5 py-0.5 rounded`}>{sds.complianceScore}/100</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${sds.complianceScore >= 90 ? 'bg-green-500' : sds.complianceScore >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${sds.complianceScore}%` }} />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Link href={`/${locale}/sds/${sds.id}`} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full">View</Button>
        </Link>
        {onExport && <Button variant="ghost" size="sm" onClick={() => onExport(sds.id, sds.chemicalName)} leftIcon={<Download size={13} />}>PDF</Button>}
        {onAudit && <Button variant="ghost" size="sm" onClick={() => onAudit(sds.id)} leftIcon={<ShieldCheck size={13} />}>Audit</Button>}
      </div>
    </div>
  );
}
