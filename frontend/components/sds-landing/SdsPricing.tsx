'use client';

import { PRICING_PLANS } from '@/lib/constant';
import { Check } from 'lucide-react';

export default function SdsPricing() {
  return (
    <section id="pricing" className="py-24 bg-slate-900/30 border-y border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Simple pricing for early SDS teams.
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm">
            Final pricing will launch with the product. Early access users may receive founder pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {PRICING_PLANS.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl p-8 flex flex-col justify-between transition-transform hover:-translate-y-1 ${
                plan.highlighted
                  ? 'bg-[#071A33] border-2 border-[#2563FF] shadow-2xl shadow-[#2563FF]/20'
                  : 'bg-[#020617] border border-slate-800'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#2563FF] text-white text-xs font-semibold uppercase tracking-wider">
                  {plan.badge}
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-xs text-slate-400 mb-6 min-h-[32px]">{plan.description}</p>

                <div className="text-2xl font-bold text-white font-mono mb-6">{plan.price}</div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-3 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-[#16A34A] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href="#waitlist"
                className={`w-full py-2.5 rounded-lg text-xs font-semibold text-center transition-colors ${
                  plan.highlighted
                    ? 'bg-[#2563FF] hover:bg-[#1D4ED8] text-white shadow-lg'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}