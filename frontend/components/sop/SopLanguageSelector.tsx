'use client';
import { LANGUAGES } from '@/utils/constants';

export default function SopLanguageSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {LANGUAGES.slice(0, 8).map((l) => (
        <button key={l.value} onClick={() => onChange(l.value)}
          className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${value === l.value ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
          {l.rtl ? '🔤 ' : ''}{l.label}
        </button>
      ))}
    </div>
  );
}
