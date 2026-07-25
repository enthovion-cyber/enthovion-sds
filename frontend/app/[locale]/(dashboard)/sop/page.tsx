'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { FileOutput } from 'lucide-react';
import { useSop } from '@/hooks/useSop';
import { useLocale } from '@/hooks/useLocale';
import SopCard from '@/components/sop/SopCard';
import Button from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';

export default function SopLibraryPage() {
  const { list, total, isLoading, fetchAll, exportPdf } = useSop();
  const { locale } = useLocale();

  useEffect(() => { fetchAll(); }, []);

  if (isLoading && !list.length) return <PageSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">SOP Library</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} standard operating procedures</p>
        </div>
        <Link href={`/${locale}/sop/generate`}>
          <Button leftIcon={<FileOutput size={14} />}>Generate SOP</Button>
        </Link>
      </div>

      {!list.length ? (
        <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
          <FileOutput size={28} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-700">No SOPs yet</p>
          <p className="text-xs text-gray-500 mt-1 mb-4">Generate an SOP from any approved SDS document</p>
          <Link href={`/${locale}/sop/generate`}>
            <Button size="sm">Generate your first SOP</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((sop) => (
            <SopCard key={sop.id} sop={sop} locale={locale} onExport={exportPdf} />
          ))}
        </div>
      )}
    </div>
  );
}
