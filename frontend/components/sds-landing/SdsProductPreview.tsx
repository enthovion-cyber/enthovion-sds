'use client';

import { ShieldCheck, AlertTriangle, Wand2, FileText, CheckCircle2 } from 'lucide-react';

export default function SdsProductPreview() {
  return (
    <div className="relative rounded-2xl border border-slate-800/80 dark:border-slate-800 bg-[#071A33]/90 dark:bg-[#071A33]/90 bg-slate-900 p-4 sm:p-6 shadow-2xl shadow-[#2563FF]/10 overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-mono text-slate-400 pl-2">
            ENTHOVION-SDS // DRAFT-AUDIT-PREVIEW
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-[#16A34A]/20 border border-[#16A34A]/40 text-[#16A34A] text-xs font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> SDS Validated
          </span>
          <span className="px-2.5 py-1 rounded bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B] text-xs font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Needs Review
          </span>
        </div>
      </div>

      {/* Main Container Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        {/* SDS Document Main Column */}
        <div className="lg:col-span-7 bg-[#020617] rounded-xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#2563FF]" />
                <h3 className="font-semibold text-white text-base">Ethylene Glycol Tech Grade</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">CAS: 107-21-1 | Formula: C2H6O2</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              GHS Rev 8
            </span>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            {/* Section 1 */}
            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800/80">
              <div className="font-semibold text-slate-200 mb-1">SECTION 1: Identification</div>
              <p className="text-slate-400">Industrial solvent, antifreeze agent. Supplier: Enthovion Chem Corp.</p>
            </div>

            {/* Section 2 with GHS pictograms */}
            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800/80">
              <div className="font-semibold text-slate-200 mb-1.5">SECTION 2: Hazard Identification</div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold text-xs">
                  ⚠
                </div>
                <div>
                  <div className="text-amber-400 font-medium">Signal Word: WARNING</div>
                  <p className="text-slate-400 text-[11px]">H302: Harmful if swallowed. H373: May cause organ damage.</p>
                </div>
              </div>
            </div>

            {/* Section 8 Warning Missing Info */}
            <div className="p-2.5 rounded bg-amber-950/20 border border-amber-500/30">
              <div className="flex items-center justify-between font-semibold text-amber-400 mb-1">
                <span>SECTION 8: Exposure Controls / Personal Protection</span>
                <span className="text-[10px] text-amber-500">Incomplete</span>
              </div>
              <p className="text-slate-400 text-[11px]">TWA limits specified for OSHA, missing ACGIH Ceiling limit definition.</p>
            </div>
          </div>
        </div>

        {/* AI Validation Side Panel */}
        <div className="lg:col-span-5 space-y-4">
          {/* AI Suggestion Card */}
          <div className="bg-[#0F172A] rounded-xl border border-[#2563FF]/30 p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded bg-[#2563FF]/20 text-[#2563FF] text-[10px] font-semibold flex items-center gap-1">
                <Wand2 className="w-3 h-3" /> AI Suggestion
              </span>
              <span className="text-xs font-mono text-slate-400">Confidence 98%</span>
            </div>
            <h4 className="text-xs font-semibold text-slate-200 mb-1">Auto-Fix Section 8 Gap</h4>
            <p className="text-xs text-slate-400 mb-3">
              Insert ACGIH TLV-C (100 mg/m³ aerosol only) to fulfill complete 16-section compliance rules.
            </p>
            <button className="w-full py-1.5 px-3 rounded bg-[#2563FF] hover:bg-[#1D4ED8] text-white text-xs font-medium transition-colors">
              Apply Suggestion
            </button>
          </div>

          {/* Compliance Audit Summary */}
          <div className="bg-[#020617] rounded-xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">Compliance Completeness</span>
              <span className="text-xs font-mono font-bold text-[#00B8D9]">15/16 Sections</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-[#00B8D9] h-full w-[93.75%]" />
            </div>

            <div className="pt-2 text-[11px] space-y-1.5">
              <div className="flex items-center text-slate-400 gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>GHS Classification Aligned</span>
              </div>
              <div className="flex items-center text-slate-400 gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Transport Info Verified (UN 3082)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}