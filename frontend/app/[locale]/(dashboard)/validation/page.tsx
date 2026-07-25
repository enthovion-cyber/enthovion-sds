'use client';
import { useEffect, useState } from 'react';
import { Sparkles, Zap, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import sdsService from '@/services/sdsService';
import validationService from '@/services/validationService';
import toast from 'react-hot-toast';

const SECTION_KEYS = Array.from({ length: 16 }, (_, idx) => `section${idx + 1}`);

const normalizeSectionKey = (key?: string) => {
  if (!key) return null;
  const match = key.toLowerCase().match(/(\d{1,2})/);
  if (!match) return null;
  const idx = Number(match[1]);
  if (!Number.isFinite(idx) || idx < 1 || idx > 16) return null;
  return `section${idx}`;
};

export default function ValidationPage() {
  const [sdsList, setSdsList] = useState<any[]>([]);
  const [sdsId, setSdsId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deepLoading, setDeepLoading] = useState(false);

  useEffect(() => { sdsService.getAll({ limit: 100 }).then(r => setSdsList(r.data.data || [])); }, []);

  const runScore = async () => {
    if (!sdsId) { toast.error('Select an SDS'); return; }
    setLoading(true);
    try { const { data } = await validationService.score(sdsId); setResult(data.data); toast.success('Validation complete'); }
    catch (error: any) { toast.error(error?.response?.data?.message || 'Validation failed'); }
    finally { setLoading(false); }
  };

  const runDeep = async () => {
    if (!sdsId) { toast.error('Select an SDS'); return; }
    setDeepLoading(true);
    try { const { data } = await validationService.deepValidate(sdsId); setResult(data.data); toast.success('Deep AI validation complete'); }
    catch (error: any) { toast.error(error?.response?.data?.message || 'Deep validation failed'); }
    finally { setDeepLoading(false); }
  };

  const scoreColor = (s: number) => s >= 85 ? 'text-green-700' : s >= 60 ? 'text-amber-700' : 'text-red-700';
  const scoreBg    = (s: number) => s >= 85 ? 'bg-green-50 border-green-200' : s >= 60 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';
  const secBg      = (s: number) => s >= 90 ? 'bg-green-50' : s >= 70 ? 'bg-amber-50' : 'bg-red-50';
  const sevColor   = (sev: string) => sev === 'critical' ? 'red' : sev === 'major' ? 'amber' : 'blue';
  const normalizedScoresMap = Object.entries(result?.section_scores || {}).reduce((acc, [key, value]) => {
    const normalized = normalizeSectionKey(key);
    if (normalized && value) acc[normalized] = value;
    return acc;
  }, {} as Record<string, any>);

  const normalizedSectionScores = SECTION_KEYS.map((key) => {
    const existing = normalizedScoresMap[key];
    return [
      key,
      existing || {
        score: 0,
        present: 0,
        total: 0,
        status: 'missing',
      },
    ] as const;
  });

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-900">AI Validation Engine</h1>
        <p className="text-sm text-gray-500 mt-0.5">Score SDS quality, detect conflicts, identify missing data, and verify classification accuracy</p>
      </div>

      <Card className="mb-5">
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-[250px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select SDS document</label>
            <select value={sdsId} onChange={e => setSdsId(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-400">
              <option value="">Choose an SDS to validate...</option>
              {sdsList.map(s => <option key={s.id} value={s.id}>{s.chemicalName || s.chemical_name}</option>)}
            </select>
          </div>
          <Button onClick={runScore} isLoading={loading} leftIcon={<Zap size={14} />}>Quick Score</Button>
          <Button onClick={runDeep} isLoading={deepLoading} leftIcon={<Sparkles size={14} />} variant="secondary">Deep AI Validate</Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Quick Score: instant rule-based check · Deep AI Validate: AI reviews accuracy, plausibility and consistency (slower)</p>
      </Card>

      {result && (
        <div className="space-y-5">
          {/* Score card */}
          <div className={`border rounded-2xl p-6 ${scoreBg(result.overall_score)}`}>
            <div className="flex items-center gap-6 flex-wrap">
              <div>
                <p className={`text-5xl font-bold ${scoreColor(result.overall_score)}`}>{result.overall_score}<span className="text-xl font-normal">/100</span></p>
                <p className={`text-sm font-semibold mt-1 ${scoreColor(result.overall_score)}`}>{result.status_label}</p>
                <p className="text-xs text-gray-600 mt-0.5">{result.confidence_label}</p>
              </div>
              <div className="flex gap-5">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{result.critical_count || 0}</p>
                  <p className="text-xs text-red-600">Critical issues</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-700">{result.total_fields_present || 0}</p>
                  <p className="text-xs text-gray-500">Fields present</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-700">{result.total_fields_checked || 0}</p>
                  <p className="text-xs text-gray-500">Fields checked</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Section scores */}
            <Card>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Section Scores</h3>
              <div className="space-y-2">
                {normalizedSectionScores.map(([k, s]) => (
                  <div key={k} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${secBg(s.score)}`}>
                    {s.status === 'complete' ? <CheckCircle size={14} className="text-green-500 flex-shrink-0" /> : s.score >= 70 ? <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" /> : <XCircle size={14} className="text-red-500 flex-shrink-0" />}
                    <span className="text-xs text-gray-700 flex-1">{k.replace('section','Section ')}</span>
                    <span className="text-xs text-gray-500">{s.present}/{s.total}</span>
                    <div className="w-16 h-1.5 bg-white rounded-full overflow-hidden"><div className={`h-full rounded-full ${s.score>=90?'bg-green-500':s.score>=70?'bg-amber-500':'bg-red-500'}`} style={{width:`${s.score}%`}} /></div>
                    <span className="text-xs font-medium w-8 text-right">{s.score}%</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Issues */}
            <div className="space-y-4">
              {/* Conflicts */}
              {result.conflicts?.length > 0 && (
                <Card>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><AlertTriangle size={14} className="text-red-500" /> Conflicts Detected</h3>
                  <div className="space-y-2">
                    {result.conflicts.map((c: any, i: number) => (
                      <div key={i} className="bg-red-50 border border-red-100 rounded-lg p-3">
                        <p className="text-xs font-medium text-red-800">{c.description}</p>
                        <p className="text-xs text-red-700 mt-1">Fix: {c.fix}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Missing items */}
              {result.missing_items?.length > 0 && (
                <Card>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Missing / Incomplete Fields ({result.missing_items.length})</h3>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {result.missing_items.slice(0, 20).map((m: any, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <Badge variant={sevColor(m.severity) as any} className="flex-shrink-0 mt-0.5">{m.severity}</Badge>
                        <p className="text-xs text-gray-700">{m.issue}</p>
                      </div>
                    ))}
                    {result.missing_items.length > 20 && <p className="text-xs text-gray-400 text-center pt-1">+{result.missing_items.length - 20} more</p>}
                  </div>
                </Card>
              )}

              {/* AI accuracy (deep validate only) */}
              {result.ai_accuracy_check && (
                <Card>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><Sparkles size={14} className="text-purple-600" /> AI Accuracy Check</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-2xl font-bold text-gray-900">{result.ai_accuracy_check.accuracy_score}%</div>
                    <p className="text-xs text-gray-500">accuracy score</p>
                  </div>
                  {result.ai_accuracy_check.accuracy_issues?.length > 0 && (
                    <div className="space-y-2">
                      {result.ai_accuracy_check.accuracy_issues.map((i: any, idx: number) => (
                        <div key={idx} className="bg-orange-50 border border-orange-100 rounded-lg p-2">
                          <p className="text-xs font-medium text-orange-800">{i.section} — {i.field}</p>
                          <p className="text-xs text-orange-700">{i.issue}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {result.ai_accuracy_check.verification_recommendations?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">Recommendations:</p>
                      {result.ai_accuracy_check.verification_recommendations.map((r: string, i: number) => (
                        <p key={i} className="text-xs text-gray-600">• {r}</p>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2 italic">{result.ai_accuracy_check.ai_confidence_note}</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}