'use client';
import { useEffect, useState } from 'react';
import { Tag, Download, Eye, Printer } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import sdsService from '@/services/sdsService';
import labelsService from '@/services/labelsService';
import { LANGUAGES } from '@/utils/constants';
import toast from 'react-hot-toast';

const SIZES = [
  { value: 'small',  label: '75×50mm', sub: 'Bottle / vial' },
  { value: 'medium', label: '100×75mm', sub: 'Container' },
  { value: 'large',  label: '148×105mm', sub: 'Drum' },
  { value: 'a4',     label: 'A4', sub: 'Storage cabinet' },
];

export default function LabelsPage() {
  const [sdsList, setSdsList] = useState<any[]>([]);
  const [sdsId, setSdsId] = useState('');
  const [size, setSize] = useState('medium');
  const [language, setLanguage] = useState('en');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  useEffect(() => { sdsService.getAll({ status: 'approved', limit: 100 }).then(r => setSdsList(r.data.data || [])); }, []);

  const generate = async () => {
    if (!sdsId) { toast.error('Select an SDS document'); return; }
    setLoading(true);
    try {
      const { data } = await labelsService.generate(sdsId, size, language);
      setResult(data.data);
      setPreviewHtml(data.data.html_preview || '');
      toast.success('Label generated');
    } catch { toast.error('Label generation failed'); }
    finally { setLoading(false); }
  };

  const exportPdf = async () => {
    if (!sdsId) return;
    try {
      const { data } = await labelsService.exportPdf(sdsId, size, language);
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url; a.download = `ghs_label_${size}.pdf`; a.click(); URL.revokeObjectURL(url);
      toast.success('Label PDF downloaded');
    } catch { toast.error('Export failed'); }
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-900">GHS Label Generator</h1>
        <p className="text-sm text-gray-500 mt-0.5">Generate print-ready GHS labels with correct pictograms, signal words, H-statements, and supplier details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Controls */}
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2"><Tag size={15} /> Label Configuration</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">SDS document</label>
              <select value={sdsId} onChange={e => setSdsId(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-400">
                <option value="">Select approved SDS...</option>
                {sdsList.map(s => <option key={s.id} value={s.id}>{s.chemicalName || s.chemical_name}{s.casNumber||s.cas_number ? ` (${s.casNumber||s.cas_number})` : ''}</option>)}
              </select>
              {!sdsList.length && <p className="text-xs text-amber-600 mt-1">No approved SDS. Approve an SDS first.</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Label size</label>
              <div className="grid grid-cols-2 gap-2">
                {SIZES.map(s => (
                  <button key={s.value} onClick={() => setSize(s.value)}
                    className={`text-left px-3 py-2.5 rounded-xl border-2 transition-all ${size === s.value ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
                    <p className="text-xs font-semibold">{s.label}</p>
                    <p className={`text-xs ${size === s.value ? 'text-gray-300' : 'text-gray-500'}`}>{s.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Output language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-400">
                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.rtl ? '🔤 ' : ''}{l.label}</option>)}
              </select>
            </div>

            <div className="flex gap-2">
              <Button onClick={generate} isLoading={loading} leftIcon={<Eye size={14} />} className="flex-1">Generate & Preview</Button>
              {result && <Button variant="secondary" onClick={exportPdf} leftIcon={<Download size={14} />}>Export PDF</Button>}
            </div>
          </Card>

          {result && (
            <Card>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Label Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Signal word</span>
                  <span className={`font-bold ${result.label_data?.signal_word === 'DANGER' ? 'text-red-700' : 'text-amber-700'}`}>{result.label_data?.signal_word || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pictograms</span>
                  <span className="text-gray-900">{(result.label_data?.pictograms || []).length} assigned</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">H-statements</span>
                  <span className="text-gray-900">{(result.label_data?.hazard_statements || []).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">P-statements</span>
                  <span className="text-gray-900">{(result.label_data?.precautionary_statements || []).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Size</span>
                  <span className="text-gray-900">{result.size_label}</span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Preview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><Eye size={15} /> Live Preview</h3>
            {previewHtml && <button onClick={() => window.print()} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900"><Printer size={12} /> Print</button>}
          </div>
          {previewHtml ? (
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="bg-gray-50 border-b border-gray-100 px-4 py-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">GHS Label Preview — {SIZES.find(s => s.value === size)?.label}</span>
                <span className="text-xs text-gray-400">{language.toUpperCase()}</span>
              </div>
              <div className="p-4 overflow-auto max-h-[550px] flex items-start justify-center bg-gray-100">
                <iframe srcDoc={previewHtml} className="border-0 bg-white shadow-md" style={{ width: '320px', height: '420px' }} title="Label Preview" />
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-16 text-center text-gray-400 h-64 flex flex-col items-center justify-center">
              <Tag size={28} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select an SDS and click Generate to preview the GHS label</p>
              <p className="text-xs mt-1 text-gray-400">Labels include pictograms, signal word, H-statements, P-statements, and supplier block</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}