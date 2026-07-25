'use client';

import { motion } from 'framer-motion';
import { FEATURES_DATA } from '@/lib/constant';
import {
  Sparkles,
  FileCheck,
  ShieldAlert,
  Wand2,
  MessageSquareCode,
  Tag,
  GitCommit,
  Globe,
  LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Sparkles,
  FileCheck,
  ShieldAlert,
  Wand2,
  MessageSquareCode,
  Tag,
  GitCommit,
  Globe,
};

export default function SdsFeatures() {
  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Everything needed for AI-powered SDS workflows.
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm">
            End-to-end tooling engineered specifically for chemical compliance and risk management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES_DATA.map((feat, idx) => {
            const IconComponent = iconMap[feat.iconName] || Sparkles;
            return (
              <motion.div
                key={feat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="group relative rounded-xl border border-slate-800/80 bg-[#0F172A]/50 dark:bg-[#0F172A]/50 p-6 hover:border-[#2563FF]/50 transition-all hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-lg bg-[#2563FF]/10 text-[#2563FF] group-hover:bg-[#2563FF] group-hover:text-white transition-colors">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    Coming Soon
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}