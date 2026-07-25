'use client';
import Link from 'next/link';
import { BookOpen, Download } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { SopDocument } from '@/types/sop.types';

export default function SopCard({ sop, locale, onExport }: { sop: SopDocument; locale: string; onExport?: (id: string, type: string, lang: string) => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <BookOpen size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <Link href={`/${locale}/sop/${sop.id}`} className="text-sm font-semibold text-gray-900 hover:text-gray-700 block truncate">
            {sop.title || 'SOP Document'}
          </Link>
          <p className="text-xs text-gray-500 mt-0.5">
            {sop.type} · {sop.isRtl ? '🇸🇦 ' : ''}{sop.language.toUpperCase()} · v{sop.version}
          </p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded font-medium flex-shrink-0 ${sop.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
          {sop.status}
        </span>
      </div>
      <div className="flex gap-2">
        <Link href={`/${locale}/sop/${sop.id}`} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full">View SOP</Button>
        </Link>
        {onExport && (
          <Button variant="ghost" size="sm" leftIcon={<Download size={13} />} onClick={() => onExport(sop.id, sop.type, sop.language)}>PDF</Button>
        )}
      </div>
    </div>
  );
}
