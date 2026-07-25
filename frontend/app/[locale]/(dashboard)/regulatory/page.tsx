'use client';
import { useEffect, useState } from 'react';
import { Globe, Zap, RefreshCw, ShieldCheck, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import regulatoryService from '@/services/regulatoryService';
import complianceService from '@/services/complianceService';
import sdsService from '@/services/sdsService';
import { JURISDICTIONS } from '@/utils/constants';
import toast from 'react-hot-toast';

const TABS = ['Hazard Classifier', 'Compliance Validator', 'Regulatory Updates', 'Frameworks'] as const;
type Tab = typeof TABS[number];

export default function RegulatoryPage() {
  const [tab, setTab] = useState<Tab>('Hazard Classifier');
  const [frameworks, setFrameworks] = useState<Record<string, any>>({});
  const [updates, setUpdates] = useState<any[]>([]);
  const [sdsList, setSdsList] = useState<any[]>([]);
  // Classifier state
  const [cForm, setCForm] = useState({ chemicalName: '', casNumber: '', formula: '', flashPoint: '', oralLd50: '' });
  const [cResult, setCResult] = useState<any>(null);
  const [cLoading, setCLoading] = useState(false);
  // Validator state
  const [vSdsId, setVSdsId] = useState('');
  const [vJurisdiction, setVJurisdiction] = useState('US_OSHA');
  const [vResult, setVResult] = useState<any>(null);
  const [vLoading, setVLoading] = useState(false);
  const [expandedSecs, setExpandedSecs] = useState<string[]>([]);
  const [autoFixPreview, setAutoFixPreview] = useState<any>(null);

  useEffect(() => {
    regulatoryService.getFrameworks().then(r => setFrameworks(r.data.data || {}));
    regulatoryService.getUpdates().then(r => setUpdates(r.data.data?.updates || []));
    sdsService.getAll({ status: 'approved', limit: 100 }).then(r => setSdsList(r.data.data || []));
  }, []);

  const classify = async () => {
    if (!cForm.chemicalName && !cForm.casNumber) { toast.error('Enter chemical name or CAS number'); return; }
    setCLoading(true);
    try {
      const { data } = await regulatoryService.classify({ chemicalName: cForm.chemicalName, casNumber: cForm.casNumber, formula: cForm.formula, physicalProperties: { flash_point: cForm.flashPoint }, toxicologyData: { oral_ld50: cForm.oralLd50 } });
      setCResult(data.data);
    } catch { toast.error('Classification failed'); }
    finally { setCLoading(false); }
  };

  const validate = async () => {
    if (!vSdsId) { toast.error('Select an SDS document'); return; }
    setVLoading(true);
    try {
      const { data } = await regulatoryService.validateSds(vSdsId, vJurisdiction);
      setVResult(data.data);
    } catch { toast.error('Validation failed'); }
    finally { setVLoading(false); }
  };

  const loadAutoFixPreview = async () => {
    if (!vSdsId) { toast.error('Select an SDS document'); return; }
    try {
      const { data } = await complianceService.getAutoFixPreview(vSdsId);
      setAutoFixPreview(data.data);
      toast.success('Auto-fix preview ready');
    } catch {
      toast.error('Unable to generate auto-fix preview');
    }
  };

  const GHS_COLORS: Record<string, string> = { GHS01:'bg-orange-100 text-orange-800', GHS02:'bg-red-100 text-red-800', GHS03:'bg-yellow-100 text-yellow-800', GHS04:'bg-blue-100 text-blue-800', GHS05:'bg-purple-100 text-purple-800', GHS06:'bg-red-200 text-red-900', GHS07:'bg-amber-100 text-amber-800', GHS08:'bg-pink-100 text-pink-800', GHS09:'bg-green-100 text-green-800' };
  const SEV_COLOR: Record<string, 'red'|'amber'|'blue'> = { critical:'red', major:'amber', minor:'blue' };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-900">Regulatory Compliance Engine</h1>
        <p className="text-sm text-gray-500 mt-0.5">Classify hazards, validate SDS compliance, and track regulatory updates across all jurisdictions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Hazard Classifier */}
      {tab === 'Hazard Classifier' && (
        <div className="space-y-5">
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Chemical Input</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Input label="Chemical name" placeholder="e.g. Acetone" value={cForm.chemicalName} onChange={e => setCForm(p => ({ ...p, chemicalName: e.target.value }))} />
              <Input label="CAS number" placeholder="67-64-1" value={cForm.casNumber} onChange={e => setCForm(p => ({ ...p, casNumber: e.target.value }))} />
              <Input label="Formula" placeholder="C3H6O" value={cForm.formula} onChange={e => setCForm(p => ({ ...p, formula: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input label="Flash point (°C) — optional" placeholder="-18" value={cForm.flashPoint} onChange={e => setCForm(p => ({ ...p, flashPoint: e.target.value }))} />
              <Input label="Oral LD50 (mg/kg) — optional" placeholder="5840" value={cForm.oralLd50} onChange={e => setCForm(p => ({ ...p, oralLd50: e.target.value }))} />
            </div>
            <Button onClick={classify} isLoading={cLoading} leftIcon={<Zap size={14} />}>Run GHS Classification</Button>
          </Card>
          {cResult && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Classification Result</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold px-3 py-1 rounded-lg ${cResult.signal_word === 'DANGER' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>⚠ {cResult.signal_word}</span>
                  <span className="text-xs text-gray-500">Confidence: {cResult.confidence}%</span>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">GHS Pictograms</p>
                <div className="flex flex-wrap gap-2">
                  {(cResult.pictograms_full || cResult.pictograms || []).map((p: any) => (
                    <span key={p.code||p} className={`text-xs px-3 py-1.5 rounded-lg font-medium ${GHS_COLORS[p.code||p] || 'bg-gray-100 text-gray-700'}`}>{p.code||p}{p.name ? ` — ${p.name}` : ''}</span>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Hazard Classifications</p>
                <div className="space-y-2">
                  {(cResult.classifications || []).map((c: any, i: number) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-900">{c.hazard_class} — {c.category}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{c.criteria_met}</p>
                      <p className="text-xs text-gray-400">{c.regulation_reference}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">H-Statements</p>
                {(cResult.h_statements_full || cResult.h_statements || []).map((h: any) => (
                  <p key={h.code||h} className="text-sm text-gray-700 mb-1"><span className="font-mono font-semibold text-red-700">{h.code||h}</span>{h.text ? `: ${h.text}` : ''}</p>
                ))}
              </div>
              {cResult.data_gaps?.length > 0 && <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">{cResult.data_gaps.map((g: string, i: number) => <p key={i} className="text-xs text-amber-700">⚠ {g}</p>)}</div>}
            </Card>
          )}
        </div>
      )}

      {/* Compliance Validator */}
      {tab === 'Compliance Validator' && (
        <div className="space-y-5">
          <Card>
            <div className="flex items-end gap-3 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select SDS document</label>
                <select value={vSdsId} onChange={e => setVSdsId(e.target.value)} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-400">
                  <option value="">Choose approved SDS...</option>
                  {sdsList.map(s => <option key={s.id} value={s.id}>{s.chemicalName || s.chemical_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction</label>
                <select value={vJurisdiction} onChange={e => setVJurisdiction(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-400">
                  {JURISDICTIONS.map(j => <option key={j.value} value={j.value}>{j.label}</option>)}
                </select>
              </div>
              <Button onClick={validate} isLoading={vLoading} leftIcon={<ShieldCheck size={14} />}>Validate</Button>
              <Button variant="secondary" onClick={loadAutoFixPreview}>Auto-fix Preview</Button>
            </div>
          </Card>
          {vResult && (
            <div className="space-y-3">
              <div className={`border rounded-xl p-5 ${vResult.score >= 90 ? 'bg-green-50 border-green-200' : vResult.score >= 60 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className={`text-4xl font-bold ${vResult.score >= 90 ? 'text-green-700' : vResult.score >= 60 ? 'text-amber-700' : 'text-red-700'}`}>{vResult.score}<span className="text-lg">/100</span></p>
                    <p className="text-sm font-semibold mt-1">{vResult.status_label}</p>
                    <p className="text-xs text-gray-600 mt-1">{vResult.framework} · {vResult.standard}</p>
                  </div>
                  <div className="flex gap-4">
                    {vResult.critical_count > 0 && <div className="text-center"><p className="text-2xl font-bold text-red-600">{vResult.critical_count}</p><p className="text-xs text-red-600">Critical</p></div>}
                    {vResult.major_count > 0 && <div className="text-center"><p className="text-2xl font-bold text-amber-600">{vResult.major_count}</p><p className="text-xs text-amber-600">Major</p></div>}
                  </div>
                </div>
              </div>
              <Card>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Section Results</p>
                <div className="space-y-1">
                  {(vResult.section_checks || []).map((s: any) => (
                    <div key={s.section}>
                      <button onClick={() => setExpandedSecs(p => p.includes(s.section) ? p.filter(x => x !== s.section) : [...p, s.section])}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg text-left transition-colors">
                        {s.complete ? <CheckCircle size={14} className="text-green-500 flex-shrink-0" /> : s.score >= 70 ? <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" /> : <XCircle size={14} className="text-red-500 flex-shrink-0" />}
                        <span className="text-sm text-gray-800 flex-1">{s.title}</span>
                        <span className="text-xs text-gray-500">{s.present}/{s.total}</span>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${s.score >= 90 ? 'bg-green-500' : s.score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${s.score}%` }} /></div>
                        {expandedSecs.includes(s.section) ? <ChevronDown size={12} className="text-gray-400" /> : <ChevronRight size={12} className="text-gray-400" />}
                      </button>
                      {expandedSecs.includes(s.section) && (
                        <div className="px-8 pb-2 space-y-1">
                          {(vResult.gaps || []).filter((g: any) => g.section === s.section).map((g: any, i: number) => (
                            <p key={i} className={`text-xs px-2 py-1 rounded ${g.severity === 'critical' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>⚠ {g.field?.replace(/_/g, ' ')}: {g.issue}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
          {autoFixPreview && (
            <Card>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Auto-fix Suggestions</p>
              <div className="space-y-2">
                {(autoFixPreview.auto_fix_suggestions || []).slice(0, 8).map((s: any, i: number) => (
                  <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-800">{s.suggestion}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Action: {s.action}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Regulatory Updates */}
      {tab === 'Regulatory Updates' && (
        <div className="space-y-3">
          {updates.map(u => (
            <Card key={u.id}>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant={SEV_COLOR[u.severity] || 'gray'}>{u.severity?.toUpperCase()}</Badge>
                    <span className="text-xs font-medium text-gray-600">{u.source}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{u.region}</span>
                    <span className="text-xs text-gray-400 ml-auto">{u.date}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{u.description}</p>
                  <div className="mt-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    <p className="text-xs font-medium text-amber-800">Action required:</p>
                    <p className="text-xs text-amber-700">{u.action_required}</p>
                  </div>
                  {u.affected_cas?.length > 0 && <p className="text-xs text-gray-500 mt-1">Affected CAS: {u.affected_cas.join(', ')}</p>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Frameworks */}
      {tab === 'Frameworks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(frameworks).map(([key, fw]: [string, any]) => (
            <Card key={key}>
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{key}</span>
                {fw.requiresArabic && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Arabic required</span>}
              </div>
              <p className="text-sm font-semibold text-gray-900">{fw.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{fw.standard}</p>
              <p className="text-xs text-gray-400 mt-2">GHS {fw.ghs_revision}</p>
              <p className="text-xs text-gray-400">OEL source: {fw.oelSource}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}