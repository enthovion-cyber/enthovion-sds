'use client';

import { motion } from 'framer-motion';
import { WORKFLOW_STEPS } from '@/lib/constant';

export default function SdsWorkflow() {
  return (
    <section id="workflow" className="py-24 bg-slate-900/30 border-y border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            From chemical input to validated SDS.
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm">
            Automated intelligence pipeline designed with human-in-the-loop validation.
          </p>
        </div>

        {/* Workflow Horizontal Line Grid */}
        <div className="relative">
          {/* Animated Connecting Line Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="h-full bg-gradient-to-r from-[#2563FF] via-[#00B8D9] to-[#16A34A] origin-left"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 relative z-10">
            {WORKFLOW_STEPS.map((step, idx) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-[#020617] rounded-xl border border-slate-800 p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-mono font-bold text-[#00B8D9] mb-3">
                    STEP {step.step}
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-400 leading-normal">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}