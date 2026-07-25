'use client';

import { USE_CASES } from '@/lib/constant';
import { Factory, ShieldCheck, Cpu, HardHat, Briefcase, GraduationCap, LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Factory,
  ShieldCheck,
  Cpu,
  HardHat,
  Briefcase,
  GraduationCap,
};

export default function SdsUseCases() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Built for teams that work with chemicals every day.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {USE_CASES.map((uc, idx) => {
            const Icon = iconMap[uc.icon] || Factory;
            return (
              <div
                key={idx}
                className="p-6 rounded-xl border border-slate-800 bg-[#0F172A]/40 dark:bg-[#0F172A]/40 hover:border-[#2563FF]/40 transition-colors"
              >
                <div className="p-3 rounded-lg bg-[#2563FF]/10 text-[#2563FF] w-fit mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">{uc.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{uc.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}