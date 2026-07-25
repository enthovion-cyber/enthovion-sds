'use client';
import { useEffect, useState, useRef } from 'react';
import { Sparkles, Send, RotateCcw, ShieldCheck, Wrench, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import sdsService from '@/services/sdsService';
import copilotService from '@/services/copilotService';
import { JURISDICTIONS } from '@/utils/constants';
import toast from 'react-hot-toast';

interface Msg { role: 'user'|'assistant'; content: string; auto_fixes?: any[]; has_compliance_issue?: boolean; timestamp: Date; }

const PROMPTS = ['Is this SDS compliant for EU CLP?','What critical fields are missing?','Check Section 8 exposure limits','Is Section 14 transport correct?','Generate quick worker safety briefing','What PPE conflicts exist?','Are H-statements consistent with classification?','What would make this SDS fully compliant?'];

export default function CopilotPage() {
  const [sdsList, setSdsList] = useState<any[]>([]);
  const [sel, setSel] = useState<any>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string|null>(null);
  const [jur, setJur] = useState('US_OSHA');
  const [summary, setSummary] = useState<any>(null);
  const [sumLoading, setSumLoading] = useState(false);
  const [fixLoading, setFixLoading] = useState<string|null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { sdsService.getAll({ limit: 100 }).then(r => setSdsList(r.data.data || [])); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || !sel || loading) return;
    setMessages(p => [...p, { role: 'user', content: msg, timestamp: new Date() }]);
    setInput(''); setLoading(true);
    try {
      const { data } = await copilotService.sendMessage({ sdsId: sel.id, message: msg, sessionId: sessionId || undefined, jurisdiction: jur, language: 'en' });
      setMessages(p => [...p, { role: 'assistant', content: data.data.message, auto_fixes: data.data.auto_fixes, has_compliance_issue: data.data.has_compliance_issue, timestamp: new Date() }]);
      if (!sessionId) setSessionId(data.data.sessionId);
    } catch { setMessages(p => [...p, { role: 'assistant', content: '❌ Error. Please try again.', timestamp: new Date() }]); }
    finally { setLoading(false); }
  };

  const loadSummary = async () => {
    if (!sel) return;
    setSumLoading(true);
    try { const { data } = await copilotService.getSummary(sel.id); setSummary(data.data); }
    catch { toast.error('Summary failed'); }
    finally { setSumLoading(false); }
  };

  const applyFix = async (fix: any) => {
    if (!sel) return;
    setFixLoading(fix.field);
    try {
      const { data } = await copilotService.autoFix({ sdsId: sel.id, section: fix.section, field: fix.field, issue: fix.description, jurisdiction: jur });
      toast.success(`Fix generated for ${fix.field.replace(/_/g, ' ')}`);
      setMessages(p => [...p, { role: 'assistant', content: `✅ **Auto-fix for ${fix.field.replace(/_/g, ' ')}**\n\n**Value:** ${JSON.stringify(data.data.fixed_value)}\n\n**Why:** ${data.data.explanation}\n\n**Regulation:** ${data.data.regulation_reference}`, timestamp: new Date() }]);
    } catch { toast.error('Auto-fix failed'); }
    finally { setFixLoading(null); }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-100 flex flex-col bg-gray-50 flex-shrink-0">
        <div className="px-4 py-4 border-b border-gray-100"><h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><Sparkles size={15} className="text-purple-600"/>Compliance Copilot</h2><p className="text-xs text-gray-500 mt-1">AI operator — answers, reasons, fixes</p></div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {sdsList.map(s => <button key={s.id} onClick={() => { setSel(s); setMessages([]); setSessionId(null); setSummary(null); }} className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors ${sel?.id === s.id ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-700'}`}><p className="font-medium truncate">{s.chemicalName || s.chemical_name}</p>{(s.complianceScore ?? s.compliance_score) != null && <p className={`mt-0.5 ${sel?.id === s.id ? (s.complianceScore ?? s.compliance_score) >= 80 ? 'text-green-300' : 'text-red-300' : (s.complianceScore ?? s.compliance_score) >= 80 ? 'text-green-600' : 'text-red-600'}`}>{s.complianceScore ?? s.compliance_score}% compliant</p>}</button>)}
        </div>
        {sel && <div className="px-3 py-3 border-t border-gray-100">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Jurisdiction</label>
          <select value={jur} onChange={e => setJur(e.target.value)} className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 bg-white mb-2">{JURISDICTIONS.map(j => <option key={j.value} value={j.value}>{j.label}</option>)}</select>
          <Button variant="secondary" size="sm" className="w-full" onClick={loadSummary} isLoading={sumLoading} leftIcon={<ShieldCheck size={12}/>}>Quick Safety Summary</Button>
        </div>}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div><p className="text-sm font-semibold text-gray-900">{sel ? (sel.chemicalName || sel.chemical_name) : 'Select an SDS'}</p><p className="text-xs text-gray-500">Copilot detects issues and suggests fixes automatically</p></div>
          {messages.length > 0 && <button onClick={() => { setMessages([]); setSessionId(null); }} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2 py-1 rounded border border-gray-200"><RotateCcw size={11}/>New</button>}
        </div>

        {summary && <div className="mx-4 mt-3 flex-shrink-0"><div className={`border rounded-xl p-4 ${summary.signal_word === 'DANGER' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center justify-between mb-2"><p className="text-xs font-semibold text-gray-800">{summary.title}</p><span className={`text-xs font-bold px-2 py-0.5 rounded ${summary.signal_word === 'DANGER' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>⚠ {summary.signal_word}</span></div>
          <div className="grid grid-cols-3 gap-3 text-xs"><div><p className="font-medium text-gray-700 mb-1">Key Hazards</p>{(summary.key_hazards || []).map((h: string, i: number) => <p key={i} className="text-gray-600">• {h}</p>)}</div><div><p className="font-medium text-gray-700 mb-1">Required PPE</p>{(summary.required_ppe || []).map((p: string, i: number) => <p key={i} className="text-gray-600">• {p}</p>)}</div><div><p className="font-medium text-gray-700 mb-1">Never Do</p>{(summary.critical_dont || []).map((d: string, i: number) => <p key={i} className="text-red-700">✗ {d}</p>)}</div></div>
          <p className="text-xs text-gray-600 mt-2 italic">{summary.worker_instruction}</p>
          <button onClick={() => setSummary(null)} className="text-xs text-gray-400 hover:text-gray-600 mt-1">Dismiss</button>
        </div></div>}

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!sel ? (
            <div className="flex flex-col items-center justify-center h-full text-center"><div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-4"><Sparkles size={24} className="text-purple-600"/></div><h3 className="text-base font-semibold text-gray-800 mb-2">Compliance Copilot</h3><p className="text-sm text-gray-500 max-w-sm">Select an SDS to activate. The copilot doesn't just answer — it detects issues, explains reasoning, and offers one-click fixes.</p></div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full"><div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center mb-4"><Sparkles size={20} className="text-white"/></div><p className="text-sm font-semibold text-gray-800 mb-5">Ask about <strong>{sel.chemicalName || sel.chemical_name}</strong></p><div className="grid grid-cols-2 gap-2 max-w-xl w-full">{PROMPTS.map((p, i) => <button key={i} onClick={() => send(p)} className="text-left text-xs px-3 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-600">{p}</button>)}</div></div>
          ) : (
            <>{messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-1 mr-2"><Sparkles size={13} className="text-white"/></div>}
                <div className={`max-w-[85%] ${m.role === 'user' ? 'bg-gray-900 text-white rounded-2xl rounded-br-sm px-4 py-2.5' : 'space-y-2'}`}>
                  {m.role === 'user' ? <p className="text-sm">{m.content}</p> : <>
                    <div className={`rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed ${m.has_compliance_issue ? 'bg-red-50 border border-red-100' : 'bg-gray-100'}`}>
                      <ReactMarkdown components={{ p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>, ul: ({ children }) => <ul className="list-disc list-inside my-1 ml-2">{children}</ul>, li: ({ children }) => <li>{children}</li>, strong: ({ children }) => <strong className="font-semibold">{children}</strong> }}>{m.content}</ReactMarkdown>
                    </div>
                    {m.auto_fixes?.map((fix, fi) => <button key={fi} onClick={() => applyFix(fix)} disabled={fixLoading === fix.field} className="flex items-center gap-2 text-xs bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 px-3 py-1.5 rounded-lg disabled:opacity-50"><Wrench size={11}/>{fixLoading === fix.field ? 'Generating...' : `Auto-fix: ${fix.description}`}</button>)}
                  </>}
                </div>
              </div>
            ))}
            {loading && <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center mr-2"><Sparkles size={13} className="text-white"/></div><div className="bg-gray-100 rounded-2xl px-4 py-3"><div className="flex gap-1">{[0,150,300].map(d => <div key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:`${d}ms`}}/>)}</div></div></div>}
            <div ref={bottomRef}/>
            </>
          )}
        </div>

        {sel && <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-end gap-2 bg-gray-50 rounded-2xl border border-gray-200 p-3">
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Ask the copilot — it will answer, reason, and suggest fixes..." rows={1} disabled={loading} className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 resize-none focus:outline-none max-h-[100px]" onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }}/>
            <button onClick={() => send()} disabled={!input.trim() || loading} className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center disabled:bg-gray-300 hover:bg-purple-700"><Send size={14} className="text-white"/></button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-1.5">All suggestions require human review · Powered by GPT-4o</p>
        </div>}
      </div>
    </div>
  );
}
