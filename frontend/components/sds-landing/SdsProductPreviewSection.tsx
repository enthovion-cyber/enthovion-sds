'use client';

import { motion } from 'framer-motion';
import { AlertCircle, FileText, CheckCircle } from 'lucide-react';

export default function SdsProductPreviewSection() {
  const sections = [
    { num: '1', name: 'Identification', status: 'Complete' },
    { num: '2', name: 'Hazard Identification', status: 'Complete' },
    { num: '3', name: 'Composition / Ingredients', status: 'Complete' },
    { num: '4', name: 'First-Aid Measures', status: 'Complete' },
    { num: '5', name: 'Fire-Fighting Measures', status: 'Complete' },
    { num: '6', name: 'Accidental Release Measures', status: 'Complete' },
    { num: '7', name: 'Handling & Storage', status: 'Complete' },
    { num: '8', name: 'Exposure Controls / PPE', status: 'Action Required' },
    { num: '14', name: 'Transport Information', status: 'Missing' },
  ];

  return (
    <section className="py-24 bg-slate-900/30 border-y border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            A cleaner way to manage SDS intelligence.
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm">
            Unified workspace for real-time section completeness tracking and automated fixes.
          </p>
        </div>

        {/* Large Mockup Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-slate-800 bg-[#071A33] p-6 shadow-2xl space-y-6"
        >
          {/* Header Info */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-white">Ethanol 96% Tech Grade</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-medium">
                  Needs Review
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">CAS: 64-17-5 | Document ID: SDS-2026-ETH96</p>
            </div>

            <div className="flex items-center gap-6">
              <div>
                <span className="text-[11px] text-slate-400 block">Compliance Score</span>
                <span className="text-lg font-mono font-bold text-amber-400">68%</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Missing Sections</span>
                <span className="text-xs font-mono text-rose-400">Exposure Limits, Transport Info</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 16 Section List */}
            <div className="lg:col-span-6 space-y-2">
              <h4 className="text-xs font-mono uppercase text-slate-400 mb-3">16-Section Structure</h4>
              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-2">
                {sections.map((sec) => (
                  <div
                    key={sec.num}
                    className="p-2.5 rounded bg-[#020617] border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-300">
                      <strong className="text-slate-500 font-mono mr-2">{sec.num}.</strong> {sec.name}
                    </span>
                    {sec.status === 'Complete' && (
                      <span className="text-[#16A34A] text-[10px] font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Validated
                      </span>
                    )}
                    {sec.status === 'Action Required' && (
                      <span className="text-amber-400 text-[10px] font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Action Required
                      </span>
                    )}
                    {sec.status === 'Missing' && (
                      <span className="text-rose-400 text-[10px] font-medium">Missing</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Suggestions Column */}
            <div className="lg:col-span-6 space-y-4">
              <h4 className="text-xs font-mono uppercase text-slate-400 mb-3">AI Suggestions</h4>

              <div className="space-y-3">
                <div className="p-3 rounded bg-[#0F172A] border border-slate-800">
                  <div className="text-xs font-medium text-slate-200">1. Add occupational exposure limits</div>
                  <p className="text-[11px] text-slate-400 mt-1">Insert OSHA PEL: 1000 ppm (1900 mg/m³) TWA.</p>
                </div>

                <div className="p-3 rounded bg-[#0F172A] border border-slate-800">
                  <div className="text-xs font-medium text-slate-200">2. Verify flash point value</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Closed cup flash point estimated at 13°C. Standard range check verified.
                  </p>
                </div>

                <div className="p-3 rounded bg-[#0F172A] border border-slate-800">
                  <div className="text-xs font-medium text-slate-200">3. Add transport classification</div>
                  <p className="text-[11px] text-slate-400 mt-1">UN 1170, ETHANOL SOLUTION, Class 3, PG II.</p>
                </div>
              </div>

              {/* Mockup Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button className="px-3 py-1.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-medium">
                  Review Gaps
                </button>
                <button className="px-3 py-1.5 rounded bg-[#2563FF] text-white text-xs font-medium">
                  Apply Suggestion
                </button>
                <button className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs font-medium">
                  Export Draft
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}