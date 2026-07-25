'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2 } from 'lucide-react';

export default function SdsWaitlist() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Chemical Engineer');
  const [interests, setInterests] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const interestOptions = [
    'SDS Generation',
    'SDS Validation',
    'Compliance Audit',
    'SDS Chatbot',
    'GHS Labels',
    'Version Control',
    'Mixtures',
  ];

  const toggleInterest = (item: string) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    // TODO: Send waitlist submission to API/email service.
    setSubmitted(true);
  };

  return (
    <section id="waitlist" className="py-24 bg-slate-900/40 border-t border-slate-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Join the Enthovion SDS early access list.
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm">
            Get launch updates, product previews, and founder pricing opportunities.
          </p>
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-2xl bg-[#071A33] border border-[#16A34A]/40 text-center space-y-4"
          >
            <CheckCircle2 className="w-12 h-12 text-[#16A34A] mx-auto" />
            <h3 className="text-xl font-bold text-white">Request Received</h3>
            <p className="text-sm text-slate-300">
              Thank you. You are on the Enthovion SDS early access list.
            </p>
          </motion.div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 rounded-2xl bg-[#020617] border border-slate-800 space-y-6"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Work Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@company.com"
                className="w-full px-4 py-2.5 rounded-lg bg-[#0F172A] border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-[#2563FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0F172A] border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-[#2563FF]"
              >
                <option>Chemical Engineer</option>
                <option>HSE / Safety</option>
                <option>Process Engineer</option>
                <option>Regulatory / Compliance</option>
                <option>Consultant</option>
                <option>Student</option>
                <option>Industrial Operator</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Primary Interests (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((opt) => {
                  const active = interests.includes(opt);
                  return (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => toggleInterest(opt)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                        active
                          ? 'bg-[#2563FF] text-white border-[#2563FF]'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-[#2563FF] hover:bg-[#1D4ED8] text-white text-sm font-semibold shadow-lg shadow-[#2563FF]/20 flex items-center justify-center gap-2 transition-all"
            >
              Request Early Access
              <Send className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-center text-slate-500">
              No spam. Only launch updates and early access information.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}