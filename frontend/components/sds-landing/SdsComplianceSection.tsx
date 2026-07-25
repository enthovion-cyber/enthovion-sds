'use client';

import { ShieldCheck, AlertCircle } from 'lucide-react';

export default function SdsComplianceSection() {
  const complianceItems = [
    'GHS hazard alignment',
    'OSHA HazCom-ready workflows',
    'EU CLP-style review support',
    'WHMIS-ready framework',
    'Label and pictogram checks',
    'Audit trail and approvals',
    'Expiry and version tracking',
    'Human-in-the-loop review',
  ];

  return (
    <section id="compliance" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Designed for compliance-aware SDS review.
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Enthovion SDS is built to support structured review workflows for chemical safety teams. AI assists with completeness checks, hazard consistency, label alignment, and regulatory readiness — while keeping final approval with qualified professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {complianceItems.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-800/80 bg-[#0F172A]/40 flex items-center gap-3"
            >
              <ShieldCheck className="w-5 h-5 text-[#16A34A] shrink-0" />
              <span className="text-xs font-medium text-slate-200">{item}</span>
            </div>
          ))}
        </div>

        {/* Professional Warning Note */}
        <div className="max-w-3xl mx-auto p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200/90 leading-relaxed">
            <strong>Regulatory Notice:</strong> AI-assisted outputs must be reviewed and approved by qualified safety or regulatory professionals before operational use.
          </p>
        </div>
      </div>
    </section>
  );
}