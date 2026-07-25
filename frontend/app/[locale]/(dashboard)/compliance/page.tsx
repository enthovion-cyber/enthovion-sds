'use client';
import { useEffect, useState } from 'react';
import { ShieldCheck, PlayCircle } from 'lucide-react';
import { useSds } from '@/hooks/useSds';
import { useCompliance } from '@/hooks/useCompliance';
import { useLocale } from '@/hooks/useLocale';
import SdsCard from '@/components/sds/SdsCard';
import AuditReport from '@/components/compliance/AuditReport';
import Button from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { JURISDICTIONS } from '@/utils/constants';
export default function CompliancePage() {
  const { list, isLoading, fetchAll, exportPdf } = useSds();
  const { report, isLoading: auditLoading, auditSds, auditLibrary } = useCompliance();
  const { locale } = useLocale();
  const [sel, setSel] = useState<string|null>(null);
  const [jur, setJur] = useState('US_OSHA');
  const [libResult, setLibResult] = useState<any>(null);
  useEffect(() => { fetchAll({ status:'approved', limit:50 }); }, []);
  if (isLoading && !list.length) return <PageSpinner/>;
  const handleLibrary = async () => { const r = await auditLibrary(jur); setLibResult(r); };
  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div><h1 className="text-xl font-semibold text-gray-900">Compliance Audit</h1><p className="text-sm text-gray-500">Scan your SDS library for regulatory gaps</p></div>
        <div className="flex gap-2 items-center">
          <select value={jur} onChange={e=>setJur(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none">
            {JURISDICTIONS.map(j=><option key={j.value} value={j.value}>{j.label}</option>)}
          </select>
          <Button leftIcon={<PlayCircle size={14}/>} isLoading={auditLoading} onClick={handleLibrary}>Audit Library</Button>
        </div>
      </div>
      {libResult&&<div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5"><p className="text-sm font-medium text-green-800">Library audit complete — {libResult.audited} documents · Avg score: {libResult.averageScore}%</p></div>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Select SDS to audit</p>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {!list.length&&<p className="text-sm text-gray-500 text-center py-8">No approved SDS. Approve an SDS first.</p>}
            {list.map(s=>(
              <div key={s.id} className={`cursor-pointer rounded-xl transition-all ${sel===s.id?'ring-2 ring-gray-900':''}`} onClick={()=>{setSel(s.id);auditSds(s.id,jur);}}>
                <SdsCard sds={s} locale={locale} onExport={exportPdf}/>
              </div>
            ))}
          </div>
        </div>
        <div>
          {auditLoading&&sel&&<div className="flex items-center justify-center h-32 text-sm text-gray-500 gap-2"><ShieldCheck size={16} className="animate-pulse"/>Running compliance audit...</div>}
          {report&&!auditLoading&&<div><p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Audit Report</p><AuditReport report={report}/></div>}
          {!report&&!auditLoading&&<div className="flex items-center justify-center h-48 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl"><div><ShieldCheck size={28} className="mx-auto mb-2 opacity-40"/><p className="text-sm">Select an SDS to run compliance audit</p></div></div>}
        </div>
      </div>
    </div>
  );
}
