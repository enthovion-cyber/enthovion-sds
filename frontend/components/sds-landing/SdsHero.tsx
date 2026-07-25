'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import SdsProductPreview from './SdsProductPreview';

export default function SdsHero() {
  const chips = [
    'AI SDS Generation',
    '16-Section Validation',
    'GHS Compliance',
    'Auto-Fix Suggestions',
    'SDS Chatbot',
    'Version Control',
  ];

  return (
    <section id="hero" className="relative pt-12 pb-20 overflow-hidden">
      {/* Background Subtle Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#2563FF]/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2563FF]/10 border border-[#2563FF]/20 text-[#2563FF] text-xs font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered SDS • Coming Soon</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.15]"
          >
            Generate, validate, and manage Safety Data Sheets with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563FF] via-[#00B8D9] to-[#2563FF]">
              industrial AI.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-600 dark:text-slate-400 font-normal leading-relaxed"
          >
            Enthovion SDS helps chemical engineers, HSE teams, and industrial operators create, audit, improve, and organize Safety Data Sheets with AI-assisted compliance workflows.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <a
              href="#waitlist"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#2563FF] hover:bg-[#1D4ED8] text-white text-sm font-semibold shadow-lg shadow-[#2563FF]/25 transition-all hover:scale-[1.02]"
            >
              Request Early Access
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Explore Features
            </a>
          </motion.div>

          {/* Trust Line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xs text-slate-500 dark:text-slate-500 pt-2"
          >
            Built for chemical engineers, HSE teams, compliance managers, and safety-critical industrial operations.
          </motion.p>

          {/* Staggered Chips */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.05, delayChildren: 0.45 },
              },
            }}
            className="flex flex-wrap justify-center gap-2 pt-4"
          >
            {chips.map((chip, idx) => (
              <motion.span
                key={idx}
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  visible: { opacity: 1, scale: 1 },
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300"
              >
                <CheckCircle2 className="w-3 h-3 text-[#00B8D9]" />
                {chip}
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* Hero Visual Product Preview Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-12"
        >
          <SdsProductPreview />
        </motion.div>
      </div>
    </section>
  );
}