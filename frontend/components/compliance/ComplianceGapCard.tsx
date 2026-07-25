'use client';
import { useState } from 'react';
import { ChevronDown, ChevronRight, Wand2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import RegulationBadge from './RegulationBadge';

interface Gap { id: string; severity: string; section: string; section_title: string; field: string; regulation_reference: string; issue: string; current_value?: string; recommended_fix: string; auto_fixable: boolean; }
interface Props { gap: Gap; onApplyFix?: (id: string, fix: string, section: string) => void; }

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'border-red-200 bg-red-50',
  major:    'border-amber-200 bg-amber-50',
  minor:    'border-blue-200 bg-blue-50',
};
const SEVERITY_LABEL: Record<string, string> = {
  critical: 'bg-red-100 text-red-800',
  major:    'bg-amber-100 text-amber-800',
  minor:    'bg-blue-100 text-blue-800',
};

export default function ComplianceGapCard({ gap, onApplyFix }: Props) {
  const [expanded, setExpanded] = useState(gap.severity === 'critical');
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    onApplyFix?.(gap.id, gap.recommended_fix, gap.section);
    setApplied(true);
  };

  return (
    <div className={`border rounded-xl overflow-hidden ${SEVERITY_STYLES[gap.severity] || 'border-gray-200'}`}>
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:opacity-80 transition-opacity">
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${SEVERITY_LABEL[gap.severity]}`}>{gap.severity}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{gap.section_title} — {gap.field?.replace(/_/g, ' ')}</p>
          <p className="text-xs text-gray-600 truncate">{gap.issue}</p>
        </div>
        <RegulationBadge reference={gap.regulation_reference} />
        {expanded ? <ChevronDown size={14} className="text-gray-400 flex-shrink-0" /> : <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-current border-opacity-10">
          <div className="pt-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Current content</p>
            <p className="text-xs text-gray-700 bg-white rounded p-2 border border-gray-200">
              {gap.current_value || <span className="text-gray-400 italic">Missing</span>}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Recommended fix</p>
            <p className="text-xs text-gray-800 bg-green-50 rounded p-2 border border-green-100">{gap.recommended_fix}</p>
          </div>
          {gap.auto_fixable && !applied && onApplyFix && (
            <Button size="sm" variant="secondary" leftIcon={<Wand2 size={12} />} onClick={handleApply}>Apply fix</Button>
          )}
          {applied && <p className="text-xs text-green-700 font-medium">✓ Fix applied — review and approve to publish</p>}
        </div>
      )}
    </div>
  );
}
