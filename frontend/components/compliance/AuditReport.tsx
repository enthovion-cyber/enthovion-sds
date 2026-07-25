'use client';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import SdsComplianceScore from '@/components/sds/SdsComplianceScore';
import ComplianceGapCard from './ComplianceGapCard';

interface AuditReportProps { report: any; onApplyFix?: (gapId: string, fix: string, sectionKey: string) => void; }

export default function AuditReport({ report, onApplyFix }: AuditReportProps) {
  if (!report) return null;

  const critical = report.gaps?.filter((g: any) => g.severity === 'critical') || [];
  const major    = report.gaps?.filter((g: any) => g.severity === 'major') || [];
  const minor    = report.gaps?.filter((g: any) => g.severity === 'minor') || [];

  return (
    <div className="space-y-5">
      {/* Score + summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-6">
        <SdsComplianceScore score={report.score} />
        <div className="flex-1">
          <p className="text-sm text-gray-700">{report.summary}</p>
          <p className="text-xs text-gray-500 mt-1">Standard: {report.standard} · Audited: {new Date(report.audited_at || Date.now()).toLocaleDateString()}</p>
          <div className="flex gap-4 mt-3">
            {critical.length > 0 && <div className="flex items-center gap-1 text-xs"><AlertTriangle size={12} className="text-red-500" /><span className="text-red-600 font-medium">{critical.length} critical</span></div>}
            {major.length > 0   && <div className="flex items-center gap-1 text-xs"><AlertCircle size={12} className="text-amber-500" /><span className="text-amber-600 font-medium">{major.length} major</span></div>}
            {minor.length > 0   && <div className="flex items-center gap-1 text-xs"><Info size={12} className="text-blue-500" /><span className="text-blue-600 font-medium">{minor.length} minor</span></div>}
            {!report.gaps?.length && <div className="flex items-center gap-1 text-xs"><CheckCircle size={12} className="text-green-500" /><span className="text-green-600 font-medium">No gaps found</span></div>}
          </div>
        </div>
      </div>

      {/* Gaps */}
      {[...critical, ...major, ...minor].map((gap: any) => (
        <ComplianceGapCard key={gap.id} gap={gap} onApplyFix={onApplyFix} />
      ))}

      {/* Passed checks */}
      {report.passed_checks?.length > 0 && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2"><CheckCircle size={14} /> Passed checks</p>
          <ul className="space-y-1">
            {report.passed_checks.map((c: string, i: number) => (
              <li key={i} className="text-xs text-green-700">✓ {c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
