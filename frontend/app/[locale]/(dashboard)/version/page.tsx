'use client';
import { useEffect, useState } from 'react';
import { Clock, ArrowLeftRight, RotateCcw, Download, ChevronDown, ChevronRight, Plus, Minus, Edit2, User } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import sdsService from '@/services/sdsService';
import versionsService from '@/services/versionsService';
import { formatDate } from '@/utils/formatters';
import toast from 'react-hot-toast';

export default function VersionsPage() {
  const [sdsList, setSdsList] = useState<any[]>([]);
  const [selectedSds, setSelectedSds] = useState<string>('');
  const [history, setHistory] = useState<any>(null);
  const [diff, setDiff] = useState<any>(null);
  const [compareA, setCompareA] = useState('');
  const [compareB, setCompareB] = useState('');
  const [loading, setLoading] = useState(false);
  const [diffLoading, setDiffLoading] = useState(false);

  useEffect(() => { sdsService.getAll({ limit: 100 }).then(r => setSdsList(r.data.data || [])); }, []);

  const loadHistory = async (id: string) => {
    setSelectedSds(id); setHistory(null); setDiff(null); setLoading(true);
    try { const { data } = await versionsService.getHistory(id); setHistory(data.data); }
    catch { toast.error('Failed to load version history'); }
    finally { setLoading(false); }
  };

  const runCompare = async () => {
    if (!compareA || !compareB) { toast.error('Select two versions to compare'); return; }
    setDiffLoading(true);
    try { const { data } = await versionsService.compare(selectedSds, parseInt(compareA), parseInt(compareB)); setDiff(data.data); }
    catch { toast.error('Comparison failed'); }
    finally { setDiffLoading(false); }
  };

  const handleRollback = async (version: number) => {
    if (!confirm(`Roll back to version ${version}? Current state will be saved as a snapshot.`)) return;
    try { await versionsService.rollback(selectedSds, version); toast.success(`Rolled back to v${version}`); loadHistory(selectedSds); }
    catch (e: any) { toast.error(e?.response?.data?.message || 'Rollback failed'); }
  };

  const exportAudit = async (format: 'json' | 'pdf') => {
    try {
      const { data } = await versionsService.exportAudit(selectedSds, format);
      if (format === 'pdf') {
        const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
        const a = document.createElement('a'); a.href = url; a.download = 'audit_trail.pdf'; a.click(); URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'audit_trail.json'; a.click();
      }
      toast.success(`Audit exported as ${format.toUpperCase()}`);
    } catch { toast.error('Export failed'); }
  };

  const typeIcon: Record<string, React.ReactNode> = {
    added: <Plus size={12} className="text-green-600" />,
    removed: <Minus size={12} className="text-red-600" />,
    modified: <Edit2 size={12} className="text-amber-600" />,
  };
  const typeBg: Record<string, string> = { added: 'bg-green-50 border-green-200', removed: 'bg-red-50 border-red-200', modified: 'bg-amber-50 border-amber-200' };

  const diffBySec = diff?.changes?.reduce((acc: Record<string, any[]>, c: any) => { acc[c.section] = [...(acc[c.section] || []), c]; return acc; }, {}) || {};

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-900">Version Control & Audit Trail</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track changes, compare versions, restore previous states, and export audit logs for compliance inspections</p>
      </div>

      {/* SDS selector */}
      <Card className="mb-5">
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-[250px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select SDS document</label>
            <select value={selectedSds} onChange={e => loadHistory(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-400">
              <option value="">Choose a document to view history...</option>
              {sdsList.map(s => <option key={s.id} value={s.id}>{s.chemicalName || s.chemical_name}</option>)}
            </select>
          </div>
          {history && (
            <>
              <Button variant="secondary" size="sm" onClick={() => exportAudit('pdf')} leftIcon={<Download size={13} />}>Export PDF</Button>
              <Button variant="ghost" size="sm" onClick={() => exportAudit('json')} leftIcon={<Download size={13} />}>Export JSON</Button>
            </>
          )}
        </div>
      </Card>

      {loading && <p className="text-sm text-gray-500 text-center py-12">Loading version history...</p>}

      {history && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Version timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Version History ({history.versions?.length || 0} revisions)</h2>
            </div>

            {/* Compare controls */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <select value={compareA} onChange={e => setCompareA(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none">
                <option value="">From version...</option>
                {(history.versions || []).map((v: any) => <option key={v.version} value={v.version}>v{v.version}</option>)}
              </select>
              <span className="text-gray-400">↔</span>
              <select value={compareB} onChange={e => setCompareB(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none">
                <option value="">To version...</option>
                {(history.versions || []).map((v: any) => <option key={v.version} value={v.version}>v{v.version}</option>)}
              </select>
              <Button variant="secondary" size="sm" onClick={runCompare} isLoading={diffLoading} leftIcon={<ArrowLeftRight size={13} />}>Compare</Button>
            </div>

            <div className="space-y-2">
              {(history.versions || []).map((v: any) => (
                <div key={v.version} className={`flex items-start gap-3 p-4 rounded-xl border ${v.version === history.sds?.current_version ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${v.version === history.sds?.current_version ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    v{v.version}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {v.version === history.sds?.current_version && <Badge variant="green">Current</Badge>}
                      <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={10} />{formatDate(v.created_at)}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1"><User size={10} />{v.users?.name || v.changed_by || 'System'}</span>
                    </div>
                    <p className="text-sm text-gray-800 truncate">{v.change_summary || 'Document updated'}</p>
                  </div>
                  {v.version !== history.sds?.current_version && (
                    <Button variant="ghost" size="sm" onClick={() => handleRollback(v.version)} leftIcon={<RotateCcw size={12} />}>Restore</Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Diff viewer */}
          <div>
            {diff ? (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">v{diff.from_version} → v{diff.to_version} — {diff.change_count} changes</p>
                  <p className="text-xs text-gray-500 mt-0.5">{diff.summary}</p>
                </div>
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {Object.entries(diffBySec).map(([sec, changes]) => (
                    <div key={sec} className="px-4 py-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{(changes as any[])[0]?.section_title || sec}</p>
                      {(changes as any[]).map((c, i) => (
                        <div key={i} className={`border rounded-lg p-3 mb-2 last:mb-0 ${typeBg[c.type] || 'bg-gray-50 border-gray-200'}`}>
                          <div className="flex items-center gap-2 mb-1.5">
                            {typeIcon[c.type]}
                            <span className="text-xs font-medium text-gray-700">{c.field_label || c.field}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ml-auto ${c.type==='added'?'bg-green-100 text-green-700':c.type==='removed'?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}`}>{c.type}</span>
                          </div>
                          {c.old_value !== null && c.type !== 'added' && <p className="text-xs text-red-700 line-through bg-red-50 px-2 py-1 rounded mb-1">{String(typeof c.old_value==='object'?JSON.stringify(c.old_value):c.old_value||'').slice(0,150)}</p>}
                          {c.new_value !== null && c.type !== 'removed' && <p className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded">{String(typeof c.new_value==='object'?JSON.stringify(c.new_value):c.new_value||'').slice(0,150)}</p>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-16 text-center text-gray-400 h-full flex flex-col items-center justify-center">
                <ArrowLeftRight size={28} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select two versions and click Compare to see what changed</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}