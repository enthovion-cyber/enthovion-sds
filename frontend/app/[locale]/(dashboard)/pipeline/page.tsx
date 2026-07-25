'use client';
import { useState } from 'react';
import { Upload, Wand2, CheckCircle, Loader2, ArrowRight, FileText, Tag, BookOpen, ShieldCheck, Zap } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { JURISDICTIONS, LANGUAGES } from '@/utils/constants';
import pipelineService from '@/services/pipelineService';
import { useLocale } from '@/hooks/useLocale';
import Link from 'next/link';
import toast from 'react-hot-toast';

type Mode = 'upload' | 'generate';

export default function PipelinePage() {
  const { locale } = useLocale();
  const [mode, setMode] = useState<Mode>('upload');
  const [file, setFile] = useState<File|null>(null);
  const [dragging, setDragging] = useState(false);
  const [jurisdiction, setJurisdiction] = useState('US_OSHA');
  const [language, setLanguage] = useState('en');
  const [autoSop, setAutoSop] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [chemName, setChemName] = useState('');
  const [casNum, setCasNum] = useState('');
  const [formula, setFormula] = useState('');

  const run = async () => {
    if (mode === 'upload' && !file) { toast.error('Select a file'); return; }
    if (mode === 'generate' && !chemName && !casNum) { toast.error('Enter chemical name or CAS'); return; }
    setLoading(true); setResult(null);
    try {
      let data;
      if (mode === 'upload') { const r = await pipelineService.upload(file!, { jurisdiction, language, autoGenerateSop: autoSop }); data = r.data.data; }
      else { const r = await pipelineService.generate({ chemicalInput: { chemicalName: chemName, casNumber: casNum, formula }, jurisdiction, language, generateLabel: true, generateSop: autoSop }); data = r.data.data; }
      setResult(data); toast.success('Pipeline complete!');
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Pipeline failed'); }
    finally { setLoading(false); }
  };

  const stepIcon = (s: string) => s === 'done' ? <CheckCircle size={16} className="text-green-500"/> : s === 'running' ? <Loader2 size={16} className="text-blue-500 animate-spin"/> : s === 'skipped' ? <div className="w-4 h-4 rounded-full bg-gray-200"/> : <div className="w-4 h-4 rounded-full border-2 border-gray-300"/>;

  return (
    <div>
      <div className="mb-5"><h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2"><Zap size={20} className="text-yellow-500"/>Intelligence Pipeline</h1><p className="text-sm text-gray-500 mt-0.5">One input → SDS + Label + SOP + Compliance report + Validation — fully automated</p></div>

      <div className="flex gap-3 mb-6">
        {(['upload','generate'] as Mode[]).map(m => <button key={m} onClick={() => { setMode(m); setResult(null); }} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 font-medium text-sm transition-all ${mode === m ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{m === 'upload' ? <Upload size={18}/> : <Wand2 size={18}/>}{m === 'upload' ? 'Upload Existing SDS' : 'Generate from Chemical'}</button>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          {mode === 'upload' ? (
            <Card>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Upload SDS Document</h3>
              <div onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if(f) setFile(f); }} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onClick={() => document.getElementById('pf')?.click()} className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragging ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <Upload size={28} className="text-gray-300 mx-auto mb-3"/>
                <p className="text-sm font-medium text-gray-700">{file ? file.name : 'Drop PDF or DOCX here'}</p>
                <p className="text-xs text-gray-400 mt-1">{file ? `${(file.size/1024/1024).toFixed(1)}MB — ready` : 'PDF, DOCX, images — up to 20MB'}</p>
                <input id="pf" type="file" className="hidden" accept=".pdf,.docx,.doc,.png,.jpg,.jpeg" onChange={e => { if(e.target.files?.[0]) setFile(e.target.files[0]); }}/>
              </div>
            </Card>
          ) : (
            <Card>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Chemical Information</h3>
              <div className="space-y-3">
                <div><label className="text-xs font-medium text-gray-700 mb-1 block">Chemical name</label><input value={chemName} onChange={e => setChemName(e.target.value)} placeholder="e.g. Hydrochloric Acid" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"/></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-medium text-gray-700 mb-1 block">CAS number</label><input value={casNum} onChange={e => setCasNum(e.target.value)} placeholder="7647-01-0" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"/></div>
                  <div><label className="text-xs font-medium text-gray-700 mb-1 block">Formula</label><input value={formula} onChange={e => setFormula(e.target.value)} placeholder="HCl" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"/></div>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Pipeline Options</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="text-xs font-medium text-gray-700 mb-1 block">Jurisdiction</label><select value={jurisdiction} onChange={e => setJurisdiction(e.target.value)} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none">{JURISDICTIONS.map(j => <option key={j.value} value={j.value}>{j.label}</option>)}</select></div>
              <div><label className="text-xs font-medium text-gray-700 mb-1 block">Language</label><select value={language} onChange={e => setLanguage(e.target.value)} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none">{LANGUAGES.slice(0,8).map(l => <option key={l.value} value={l.value}>{l.label}</option>)}</select></div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={autoSop} onChange={e => setAutoSop(e.target.checked)} className="rounded"/><span className="text-sm text-gray-700">Auto-generate handling SOP</span></label>
          </Card>

          <Button onClick={run} isLoading={loading} size="lg" className="w-full" leftIcon={<Zap size={16}/>}>{loading ? 'Running pipeline...' : 'Run Intelligence Pipeline'}</Button>
          {loading && <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center"><Loader2 size={20} className="animate-spin text-blue-600 mx-auto mb-2"/><p className="text-sm text-blue-800 font-medium">AI pipeline running</p><p className="text-xs text-blue-600 mt-1">Extract → Classify → Validate → Label → SOP</p></div>}
        </div>

        <div>
          {result ? <div className="space-y-4">
            <Card><h3 className="text-sm font-semibold text-gray-900 mb-3">Pipeline Steps</h3>
              <div className="space-y-2">{(result.steps||[]).map((s: any) => <div key={s.step} className="flex items-start gap-3 py-1.5">{stepIcon(s.status)}<div><p className="text-sm font-medium text-gray-800">{s.name}</p>{s.result && <p className="text-xs text-gray-500">{s.result}</p>}</div></div>)}</div>
              <p className="text-xs text-gray-400 mt-3">Completed in {((result.duration_ms||0)/1000).toFixed(1)}s</p>
            </Card>
            <Card><h3 className="text-sm font-semibold text-gray-900 mb-3">Generated Output</h3>
              <div className="space-y-2">
                {result.output?.sds && <Link href={`/${locale}/sds/${result.output.sds.id}` as any} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"><FileText size={16} className="text-gray-600"/><div className="flex-1"><p className="text-sm font-medium">SDS Document</p><p className="text-xs text-gray-500">{result.output.sds.chemical_name} — {result.output.sds.status}</p></div><ArrowRight size={14} className="text-gray-400"/></Link>}
                {result.output?.label && <Link href={`/${locale}/labels` as any} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"><Tag size={16} className="text-gray-600"/><div className="flex-1"><p className="text-sm font-medium">GHS Label</p><p className="text-xs text-gray-500">Medium size · {language.toUpperCase()}</p></div><ArrowRight size={14} className="text-gray-400"/></Link>}
                {result.output?.sop && <Link href={`/${locale}/sop/${result.output.sop.id}` as any} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"><BookOpen size={16} className="text-gray-600"/><div className="flex-1"><p className="text-sm font-medium">Handling SOP</p><p className="text-xs text-gray-500">{language.toUpperCase()}</p></div><ArrowRight size={14} className="text-gray-400"/></Link>}
                {result.output?.compliance && <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"><ShieldCheck size={16} className={result.output.compliance.score >= 80 ? 'text-green-600' : 'text-amber-600'}/><div><p className="text-sm font-medium">Compliance Report</p><p className="text-xs text-gray-500">{result.output.compliance.score}/100 — {result.output.compliance.status}</p></div></div>}
              </div>
            </Card>
            <div className="grid grid-cols-2 gap-3">
              <Card><p className="text-xs text-gray-500 mb-1">Validation</p><p className={`text-2xl font-bold ${(result.output?.validation?.score||0)>=80?'text-green-700':'text-amber-700'}`}>{result.output?.validation?.score||0}<span className="text-sm font-normal">/100</span></p></Card>
              <Card><p className="text-xs text-gray-500 mb-1">Compliance</p><p className={`text-2xl font-bold ${(result.output?.compliance?.score||0)>=80?'text-green-700':'text-amber-700'}`}>{result.output?.compliance?.score||0}<span className="text-sm font-normal">/100</span></p></Card>
            </div>
            {result.next_actions?.length > 0 && <Card><h3 className="text-sm font-semibold text-gray-900 mb-3">Next Steps</h3>{result.next_actions.map((a: any, i: number) => <Link key={i} href={`/${locale}${a.link}` as any} className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 py-1 hover:underline"><span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 text-xs flex items-center justify-center font-medium">{i+1}</span>{a.action}{a.count ? ` (${a.count})` : ''}</Link>)}</Card>}
          </div> : <div className="border-2 border-dashed border-gray-200 rounded-xl p-16 text-center h-full flex flex-col items-center justify-center text-gray-400"><Zap size={32} className="mb-4 opacity-20"/><p className="text-sm font-medium">Pipeline output appears here</p><p className="text-xs mt-2 max-w-xs">Configure your input and run the pipeline to get a complete SDS package</p></div>}
        </div>
      </div>
    </div>
  );
}