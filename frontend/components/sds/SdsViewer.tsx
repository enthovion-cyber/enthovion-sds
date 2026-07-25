'use client';

import { useState } from 'react';
import { 
  ChevronDown, 
  Tag, 
  TriangleAlert, 
  FlaskConical, 
  HeartPulse, 
  Flame, 
  Droplets, 
  Package, 
  ShieldCheck, 
  TestTube, 
  Zap, 
  Skull, 
  Leaf, 
  Trash2, 
  Truck, 
  ClipboardList, 
  Info
} from 'lucide-react';
import type { SdsDocument } from '@/types/sds.types';

// Using Lucide icons for a unified, professional look
const SECTION_ICONS: Record<string, React.ElementType> = {
  section1: Tag,
  section2: TriangleAlert,
  section3: FlaskConical,
  section4: HeartPulse,
  section5: Flame,
  section6: Droplets,
  section7: Package,
  section8: ShieldCheck,
  section9: TestTube,
  section10: Zap,
  section11: Skull,
  section12: Leaf,
  section13: Trash2,
  section14: Truck,
  section15: ClipboardList,
  section16: Info,
};

// Helper to format object keys neatly (e.g., "vapor_pressure" -> "Vapor Pressure")
const formatKey = (key: string) => {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

function renderContent(content: unknown, depth = 0): React.ReactNode {
  // Empty State
  if (content == null || content === '') {
    return <span className="text-slate-400 text-sm italic">Not specified</span>;
  }

  // Primitives
  if (typeof content === 'string' || typeof content === 'number') {
    return <span className="text-sm text-slate-700 leading-relaxed">{String(content)}</span>;
  }

  // Arrays
  if (Array.isArray(content)) {
    if (!content.length) return <span className="text-slate-400 text-sm italic">None</span>;
    return (
      <ul className="space-y-1.5 mt-1">
        {content.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-slate-700">
            <span className="text-slate-300 mt-0.5">•</span>
            <span>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</span>
          </li>
        ))}
      </ul>
    );
  }

  // Objects
  if (typeof content === 'object') {
    const entries = Object.entries(content as Record<string, unknown>);
    if (!entries.length) return null;

    return (
      <div className={`space-y-4 ${depth > 0 ? 'pl-4 border-l-2 border-slate-100 mt-2' : ''}`}>
        {entries.map(([k, v]) => (
          <div key={k} className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {formatKey(k)}
            </span>
            <div className="text-slate-800">{renderContent(v, depth + 1)}</div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

function SdsSection({ 
  sectionKey, 
  section 
}: { 
  sectionKey: string; 
  section: { title?: string; content?: unknown } 
}) {
  const [open, setOpen] = useState(sectionKey === 'section1' || sectionKey === 'section2');
  const Icon = SECTION_ICONS[sectionKey] || Info;
  const num = sectionKey.replace('section', '');

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:border-slate-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-slate-50 transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <div className="flex items-center gap-4">
          {/* Section Number Badge */}
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-100 text-slate-500 text-xs font-bold shrink-0">
            {num}
          </div>
          
          {/* Icon */}
          <div className="text-blue-500 shrink-0">
            <Icon size={18} strokeWidth={2.5} />
          </div>
          
          {/* Title */}
          <span className="text-sm font-semibold text-slate-800 tracking-tight">
            {section?.title || `Section ${num}`}
          </span>
        </div>

        {/* Chevron Container */}
        <div className={`p-1 rounded-full transition-transform duration-300 ease-in-out ${open ? 'rotate-180 bg-slate-100' : ''}`}>
          <ChevronDown size={16} className="text-slate-400" />
        </div>
      </button>

      {/* Smooth Expand/Collapse Content Area */}
      <div 
        className={`grid transition-all duration-300 ease-in-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-5 pt-2 border-t border-slate-100 bg-slate-50/50">
            {renderContent(section?.content)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SdsViewer({ sds }: { sds: SdsDocument }) {
  const sections = sds.sections || {};
  
  return (
    <div className="w-full max-w-4xl mx-auto space-y-3">
      {Object.entries(sections).map(([key, section]) => (
        <SdsSection 
          key={key} 
          sectionKey={key} 
          section={section as { title?: string; content?: unknown }} 
        />
      ))}
    </div>
  );
}