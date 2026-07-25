'use client';
import { AlertTriangle } from 'lucide-react';
import type { SopDocument } from '@/types/sop.types';

export default function SopViewer({ sop }: { sop: SopDocument }) {
  const c = sop.content;
  const isRTL = sop.isRtl || sop.language === 'ar';

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'font-arabic' : ''}>
      {/* Header */}
      <div className="bg-gray-900 text-white rounded-xl p-5 mb-5">
        <h1 className="text-lg font-bold">{c.title}</h1>
        <p className="text-sm text-gray-300 mt-1">{c.chemicalName} · {c.sopType} · v{sop.version}</p>
      </div>

      {/* PPE */}
      {c.requiredPpe?.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Required PPE</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {c.requiredPpe.map((p, i) => (
              <div key={i} className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                <p className="text-xs font-semibold text-amber-900">{p.item}</p>
                <p className="text-xs text-amber-700 mt-0.5">{p.specification}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Steps */}
      {c.procedureSteps?.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Procedure</h2>
          <div className="space-y-2">
            {c.procedureSteps.map((step) => (
              <div key={step.step} className={`flex gap-3 p-3 rounded-lg border ${step.critical ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${step.critical ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'}`}>
                  {step.step}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{step.action}</p>
                  {step.warning && (
                    <div className="flex items-center gap-1.5 mt-1.5 bg-amber-50 border border-amber-100 rounded px-2 py-1">
                      <AlertTriangle size={12} className="text-amber-600" />
                      <p className="text-xs text-amber-700">{step.warning}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency */}
      {c.emergencyProcedures && Object.keys(c.emergencyProcedures).length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-red-900 mb-3">Emergency Procedures</h2>
          {Object.entries(c.emergencyProcedures).map(([k, v]) => (
            <div key={k} className="mb-2 last:mb-0">
              <span className="text-xs font-semibold text-red-700 uppercase">{k.replace(/_/g, ' ')}: </span>
              <span className="text-xs text-red-800">{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
