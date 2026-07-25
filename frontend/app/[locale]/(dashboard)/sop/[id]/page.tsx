'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Download, Printer } from 'lucide-react';
import SopViewer from '@/components/sop/SopViewer';
import SopPrintView from '@/components/sop/SopPrintView';
import SopLanguageSelector from '@/components/sop/SopLanguageSelector';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { useSop } from '@/hooks/useSop';
import { useLocale } from '@/hooks/useLocale';

export default function SopDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { current, isLoading, fetchById, exportPdf } = useSop();
  const { locale } = useLocale();
  const [printMode, setPrintMode] = useState(false);

  useEffect(() => { fetchById(id); }, [id]);

  if (isLoading && !current) return <PageSpinner />;
  if (!current) return <div className="text-sm text-gray-500 p-8">SOP not found</div>;

  if (printMode) {
    return (
      <div>
        <div className="flex gap-2 mb-4 print:hidden">
          <Button variant="secondary" onClick={() => setPrintMode(false)}>← Back</Button>
          <Button onClick={() => window.print()} leftIcon={<Printer size={14} />}>Print</Button>
        </div>
        <SopPrintView sop={current} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{current.content?.title || 'SOP Document'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {current.type} · {current.isRtl ? '🔤 ' : ''}{current.language?.toUpperCase()} · v{current.version}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" leftIcon={<Printer size={14} />} onClick={() => setPrintMode(true)}>Print view</Button>
          <Button leftIcon={<Download size={14} />} onClick={() => exportPdf(id, current.type, current.language)}>Export PDF</Button>
        </div>
      </div>

      <Card>
        <SopViewer sop={current} />
      </Card>
    </div>
  );
}
