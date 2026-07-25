'use client';

import { motion } from 'framer-motion';
import { XCircle, CheckCircle } from 'lucide-react';

export default function SdsProblemSolution() {
  const problems = [
    'SDS documents are scattered across folders and emails',
    'Manual 16-section review takes time',
    'Compliance gaps are easy to miss',
    'Hazard classifications can become inconsistent',
    'Expiry and version tracking is often weak',
    'Engineers waste time searching for safety information',
  ];

  const solutions = [
    'AI-assisted SDS generation',
    '16-section completeness validation',
    'GHS and regulatory checks',
    'Auto-fix suggestions for weak or missing sections',
    'Version history and audit trail',
    'Searchable SDS knowledge layer',
  ];

  return (
    <section className="py-20 bg-slate-900/40 dark:bg-slate-900/40 border-y border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            SDS management is still too manual.
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm">
            Transition from unstructured legacy PDFs to structured, AI-audited chemical intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Problem Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 dark:bg-slate-950/60 border border-rose-500/20 shadow-xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold mb-6">
              The Problem
            </div>
            <ul className="space-y-4">
              {problems.map((prob, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300">{prob}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Solution Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 dark:bg-slate-950/60 border border-[#2563FF]/30 shadow-xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2563FF]/10 text-[#2563FF] text-xs font-semibold mb-6">
              The Enthovion Solution
            </div>
            <ul className="space-y-4">
              {solutions.map((sol, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-200 font-medium">{sol}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}