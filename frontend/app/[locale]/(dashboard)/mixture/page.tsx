'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Beaker, Zap, Search, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import mixturesService from '@/services/mixturesService';
import { JURISDICTIONS } from '@/utils/constants';
import toast from 'react-hot-toast';

interface Component {
  chemical_name: string; cas_number: string; concentration_percent: string;
  concentration_max: string; role: string; ate_oral: string;
  is_carcinogen_cat1: boolean; is_carcinogen_cat2: boolean;
  is_reproductive_tox: boolean; is_skin_sensitiser: boolean; is_skin_corrosive: boolean;
}

const EMPTY_COMP: Component = { chemical_name:'', cas_number:'', concentration_percent:'', concentration_max:'', role:'active', ate_oral:'', is_carcinogen_cat1:false, is_carcinogen_cat2:false, is_reproductive_tox:false, is_skin_sensitiser:false, is_skin_corrosive:false };

export default function MixturesPage() {
  const [mixtures, setMixtures] = useState<any[]>([]);
  const [tab, setTab] = useState<'list'|'builder'>('list');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [jurisdiction, setJurisdiction] = useState('US_OSHA');
  const [components, setComponents] = useState<Component[]>([{ ...EMPTY_COMP }]);
  const [saving, setSaving] = useState(false);
  const [calcLoading, setCalcLoading] = useState<string|null>(null);
  const [expandedMix, setExpandedMix] = useState<string|null>(null);
  const [simResult, setSimResult] = useState<any>(null);
  const [optimizingId, setOptimizingId] = useState<string|null>(null);

  useEffect(() => { loadMixtures(); }, []);

  const loadMixtures = () => {
    mixturesService.getAll().then(r => setMixtures(r.data.data || []));
  };

  const addComp = () => setComponents(p => [...p, { ...EMPTY_COMP }]);
  const removeComp = (i: number) => setComponents(p => p.filter((_, idx) => idx !== i));
  const updateComp = (i: number, field: keyof Component, val: string | boolean) =>
    setComponents(p => p.map((c, idx) => idx === i ? { ...c, [field]: val } : c));

  const getTotalConc = () => components.reduce((s, c) => s + (parseFloat(c.concentration_percent) || 0), 0);

  const autoFillComponent = async (i: number) => {
    const comp = components[i];
    if (!comp.cas_number && !comp.chemical_name) {
      toast.error('Enter CAS or chemical name first');
      return;
    }
    try {
      const { data } = await mixturesService.autoFillComponent({
        cas_number: comp.cas_number || undefined,
        chemical_name: comp.chemical_name || undefined,
      });
      const next = data.data || {};
      updateComp(i, 'chemical_name', next.chemical_name || comp.chemical_name);
      updateComp(i, 'is_skin_sensitiser', !!next.inferred_flags?.is_skin_sensitiser);
      updateComp(i, 'is_skin_corrosive', !!next.inferred_flags?.is_skin_corrosive);
      updateComp(i, 'is_carcinogen_cat1', !!next.inferred_flags?.is_carcinogen_cat1);
      updateComp(i, 'is_reproductive_tox', !!next.inferred_flags?.is_reproductive_tox);
      toast.success('Component auto-filled from intelligence lookup');
    } catch {
      toast.error('Auto-fill failed');
    }
  };

  const saveMixture = async () => {
    if (!name.trim()) { toast.error('Enter a mixture name'); return; }
    if (!components.some(c => c.chemical_name)) { toast.error('Add at least one component'); return; }
    setSaving(true);
    try {
      await mixturesService.create({ name, description: desc, jurisdiction, components });
      toast.success('Mixture saved');
      setName(''); setDesc(''); setComponents([{ ...EMPTY_COMP }]);
      loadMixtures(); setTab('list');
    } catch { toast.error('Failed to save mixture'); }
    finally { setSaving(false); }
  };

  const calculate = async (id: string) => {
    setCalcLoading(id);
    try {
      const { data } = await mixturesService.calculate(id);
      toast.success(`Calculation complete — Signal word: ${data.data.overall_signal_word}`);
      loadMixtures();
    } catch { toast.error('Calculation failed'); }
    finally { setCalcLoading(null); }
  };

  const deleteMix = async (id: string) => {
    if (!confirm('Delete this mixture?')) return;
    try { await mixturesService.delete(id); loadMixtures(); toast.success('Deleted'); }
    catch { toast.error('Delete failed'); }
  };

  const simulateMix = async (mixId: string, componentId: string, concentrationPercent: number) => {
    try {
      const { data } = await mixturesService.simulate(mixId, { componentId, concentrationPercent });
      setSimResult({ mixId, ...(data.data || {}) });
      toast.success('What-if simulation complete');
    } catch {
      toast.error('Simulation failed');
    }
  };

  const optimizeMix = async (mixId: string) => {
    setOptimizingId(mixId);
    try {
      const { data } = await mixturesService.optimize(mixId, { goal: 'Reduce hazard' });
      setSimResult({ mixId, optimization: data.data });
      toast.success('Optimization suggestions generated');
    } catch {
      toast.error('Optimization failed');
    } finally {
      setOptimizingId(null);
    }
  };

  const GHS_COLORS: Record<string,string> = { GHS02:'bg-red-100 text-red-800', GHS06:'bg-red-200 text-red-900', GHS07:'bg-amber-100 text-amber-800', GHS08:'bg-pink-100 text-pink-800', GHS09:'bg-green-100 text-green-800', GHS05:'bg-purple-100 text-purple-800' };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Mixture Hazard Calculator</h1>
          <p className="text-sm text-gray-500 mt-0.5">Build multi-component formulations and calculate GHS hazard classification using bridging principles</p>
        </div>
        <div className="flex gap-2">
          <Button variant={tab==='list'?'primary':'secondary'} size="sm" onClick={() => setTab('list')}>My Mixtures</Button>
          <Button variant={tab==='builder'?'primary':'secondary'} size="sm" onClick={() => setTab('builder')} leftIcon={<Plus size={14}/>}>New Mixture</Button>
        </div>
      </div>

      {/* Builder */}
      {tab === 'builder' && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Mixture Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Mixture name *" placeholder="e.g. Industrial Cleaner XC-40" value={name} onChange={e => setName(e.target.value)} />
              <Input label="Description" placeholder="Brief description" value={desc} onChange={e => setDesc(e.target.value)} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction</label>
                <select value={jurisdiction} onChange={e => setJurisdiction(e.target.value)} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-400">
                  {JURISDICTIONS.map(j => <option key={j.value} value={j.value}>{j.label}</option>)}
                </select>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Components</h3>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2 py-1 rounded ${Math.abs(getTotalConc()-100)<0.5?'bg-green-100 text-green-800':getTotalConc()>100?'bg-red-100 text-red-800':'bg-amber-100 text-amber-800'}`}>
                  Total: {getTotalConc().toFixed(1)}%
                </span>
                <Button variant="secondary" size="sm" onClick={addComp} leftIcon={<Plus size={13}/>}>Add Component</Button>
              </div>
            </div>
            <div className="space-y-4">
              {components.map((comp, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-600">Component {i+1}</span>
                    {components.length > 1 && <button onClick={() => removeComp(i)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <Input label="Chemical name *" placeholder="Isopropanol" value={comp.chemical_name} onChange={e => updateComp(i,'chemical_name',e.target.value)} />
                    <Input label="CAS number" placeholder="67-63-0" value={comp.cas_number} onChange={e => updateComp(i,'cas_number',e.target.value)} />
                    <Input label="Min conc. %" placeholder="60" value={comp.concentration_percent} onChange={e => updateComp(i,'concentration_percent',e.target.value)} />
                    <Input label="Max conc. %" placeholder="70" value={comp.concentration_max} onChange={e => updateComp(i,'concentration_max',e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                      <select value={comp.role} onChange={e => updateComp(i,'role',e.target.value)} className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-gray-400">
                        {['active','solvent','additive','impurity','preservative'].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <Input label="Oral LD50 mg/kg (ATE)" placeholder="5840" value={comp.ate_oral} onChange={e => updateComp(i,'ate_oral',e.target.value)} />
                    <div className="flex items-end">
                      <Button variant="secondary" size="sm" onClick={() => autoFillComponent(i)} leftIcon={<Search size={12}/>}>
                        Auto-fill
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {([['is_carcinogen_cat1','Carcinogen Cat 1'],['is_carcinogen_cat2','Carcinogen Cat 2'],['is_reproductive_tox','Repro. Tox'],['is_skin_sensitiser','Skin Sensitiser'],['is_skin_corrosive','Skin Corrosive']] as [keyof Component, string][]).map(([field, label]) => (
                      <label key={field} className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={comp[field] as boolean} onChange={e => updateComp(i,field,e.target.checked)} className="rounded" />
                        <span className="text-xs text-gray-600">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={saveMixture} isLoading={saving} leftIcon={<Beaker size={14}/>}>Save Mixture</Button>
              <Button variant="secondary" onClick={() => setTab('list')}>Cancel</Button>
            </div>
          </Card>
        </div>
      )}

      {/* List */}
      {tab === 'list' && (
        <div>
          {!mixtures.length ? (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-16 text-center">
              <Beaker size={28} className="mx-auto mb-3 text-gray-300"/>
              <p className="text-sm font-medium text-gray-700">No mixtures yet</p>
              <p className="text-xs text-gray-500 mt-1 mb-4">Create a multi-component formulation to calculate GHS hazard classification</p>
              <Button size="sm" onClick={() => setTab('builder')} leftIcon={<Plus size={14}/>}>Create First Mixture</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {mixtures.map(m => (
                <Card key={m.id} className="!p-0 overflow-hidden">
                  <div className="flex items-start justify-between p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-sm font-semibold text-gray-900">{m.name}</h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{m.jurisdiction}</span>
                        <span className="text-xs text-gray-500">{(m.components||[]).length} components</span>
                      </div>
                      {m.description && <p className="text-xs text-gray-500">{m.description}</p>}
                      {m.hazard_calculation && (
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${m.hazard_calculation.overall_signal_word==='DANGER'?'bg-red-100 text-red-800':'bg-amber-100 text-amber-800'}`}>
                            ⚠ {m.hazard_calculation.overall_signal_word}
                          </span>
                          {(m.hazard_calculation.pictograms||[]).slice(0,4).map((p:string) => (
                            <span key={p} className={`text-xs px-2 py-0.5 rounded ${GHS_COLORS[p]||'bg-gray-100 text-gray-700'}`}>{p}</span>
                          ))}
                          <span className="text-xs text-gray-500">Confidence: {m.hazard_calculation.confidence_score}%</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <Button variant="secondary" size="sm" isLoading={calcLoading===m.id} onClick={() => calculate(m.id)} leftIcon={<Zap size={12}/>}>
                        {m.hazard_calculation ? 'Recalculate' : 'Calculate Hazards'}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => optimizeMix(m.id)} isLoading={optimizingId===m.id}>
                        Optimize
                      </Button>
                      <button onClick={() => setExpandedMix(expandedMix===m.id?null:m.id)} className="p-1.5 text-gray-400 hover:text-gray-700">
                        {expandedMix===m.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                      </button>
                      <button onClick={() => deleteMix(m.id)} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                    </div>
                  </div>

                  {expandedMix === m.id && (
                    <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Components</p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead><tr className="border-b border-gray-200">{['Chemical','CAS','Min %','Max %','Role','ATE oral'].map(h=><th key={h} className="text-left py-1.5 px-2 text-gray-500 font-medium whitespace-nowrap">{h}</th>)}</tr></thead>
                          <tbody className="divide-y divide-gray-100">
                            {(m.components||[]).map((c:any,i:number)=>(
                              <tr key={i}>
                                <td className="py-1.5 px-2 font-medium text-gray-800">{c.chemical_name||'—'}</td>
                                <td className="py-1.5 px-2 text-gray-500 font-mono">{c.cas_number||'—'}</td>
                                <td className="py-1.5 px-2 text-gray-600">{c.concentration_percent||'—'}%</td>
                                <td className="py-1.5 px-2 text-gray-600">{c.concentration_max||c.concentration_percent||'—'}%</td>
                                <td className="py-1.5 px-2"><span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{c.role||'active'}</span></td>
                                <td className="py-1.5 px-2 text-gray-600">{c.ate_oral?`${c.ate_oral} mg/kg`:'—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {m.hazard_calculation?.acute_toxicity_calculation?.ate_mix && (
                        <div className="mt-3 bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs font-semibold text-gray-700 mb-1">Acute Toxicity Calculation (GHS Additivity Formula)</p>
                          <p className="text-xs text-gray-600">ATE<sub>mix</sub> = {m.hazard_calculation.acute_toxicity_calculation.ate_mix} mg/kg — {m.hazard_calculation.acute_toxicity_calculation.oral_category?.label || 'Not classified'}</p>
                        </div>
                      )}
                      {(m.components || []).length > 0 && (
                        <div className="mt-3 bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs font-semibold text-gray-700 mb-2">What-if Simulator</p>
                          <div className="flex flex-wrap gap-2">
                            {(m.components || []).slice(0, 3).map((c: any, i: number) => (
                              <button
                                key={i}
                                onClick={() => simulateMix(m.id, String(i), Math.max(0, (parseFloat(c.concentration_percent) || 0) - 5))}
                                className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                              >
                                Reduce {c.chemical_name || `Component ${i + 1}`} by 5%
                              </button>
                            ))}
                          </div>
                          {simResult?.mixId === m.id && simResult?.updated_hazards && (
                            <p className="text-xs text-gray-600 mt-2">
                              Simulated signal word: <span className="font-semibold">{simResult.updated_hazards.overall_signal_word}</span>
                            </p>
                          )}
                          {simResult?.mixId === m.id && simResult?.optimization?.optimization_suggestions?.length > 0 && (
                            <p className="text-xs text-gray-600 mt-2">
                              Suggestion: {simResult.optimization.optimization_suggestions[0].rationale}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}