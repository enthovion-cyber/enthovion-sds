'use client';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Download, ShieldCheck, CheckCircle, QrCode } from 'lucide-react';
import SdsViewer from '@/components/sds/SdsViewer';
import SdsComplianceScore from '@/components/sds/SdsComplianceScore';
import SdsQrCode from '@/components/sds/SdsQrCode';
import SdsChatbot from '@/components/chatbot/SdsChatbot';
import AuditReport from '@/components/compliance/AuditReport';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { useSds } from '@/hooks/useSds';
import { useCompliance } from '@/hooks/useCompliance';
import { useLocale } from '@/hooks/useLocale';
import { formatDate, getStatusBadgeClass } from '@/utils/formatters';

export default function SdsDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { current, isLoading, fetchById, approve, exportPdf } = useSds();
  const { report, isLoading: auditLoading, auditSds, fetchReport } = useCompliance();
  const { locale } = useLocale();

  useEffect(() => {
    fetchById(id);
    fetchReport(id);
  }, [id]);

  if (isLoading && !current) return <PageSpinner />;
  if (!current) return <div className="text-sm text-gray-500 p-8">SDS not found</div>;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-semibold text-gray-900">{current.chemicalName}</h1>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${getStatusBadgeClass(current.status)}`}>
              {current.status === 'pending_review' ? 'Pending review' : current.status}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {current.casNumber && `CAS: ${current.casNumber} · `}
            {current.jurisdiction?.replace('_', ' ')} · {current.language?.toUpperCase()} · v{current.version}
          </p>
          {current.expiresAt && (
            <p className="text-xs text-gray-400 mt-0.5">Review by: {formatDate(current.expiresAt)}</p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {current.status !== 'approved' && (
            <Button leftIcon={<CheckCircle size={14} />} onClick={() => approve(id)}>Approve &amp; publish</Button>
          )}
          <Button variant="secondary" leftIcon={<Download size={14} />} onClick={() => exportPdf(id, current.chemicalName)}>Export PDF</Button>
          <Button variant="outline" leftIcon={<ShieldCheck size={14} />} isLoading={auditLoading} onClick={() => auditSds(id)}>Run audit</Button>
        </div>
      </div>

      {/* 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main — SDS sections */}
        <div className="lg:col-span-2 space-y-4">
          <SdsViewer sds={current} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Compliance score */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Compliance</h3>
            <SdsComplianceScore score={current.complianceScore} />
          </Card>

          {/* QR code */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">QR access</h3>
            <SdsQrCode sdsId={id} chemicalName={current.chemicalName} />
          </Card>

          {/* Audit report */}
          {report && (
            <Card padding={false}>
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Audit report</h3>
              </div>
              <div className="p-5">
                <AuditReport report={report} />
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Floating chatbot */}
      <SdsChatbot sdsId={id} chemicalName={current.chemicalName} />
    </div>
  );
}
