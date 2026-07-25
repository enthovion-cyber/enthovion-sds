'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import SdsLogo from './SdsLogo';
import ThemeToggle from '../ThemeToggle';

export default function SdsHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Overview', href: '#hero' },
    { name: 'Features', href: '#features' },
    { name: 'Workflow', href: '#workflow' },
    { name: 'Compliance', href: '#compliance' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 backdrop-blur-md bg-[#020617]/80 dark:bg-[#020617]/80 bg-slate-50/80 border-b border-slate-800/60 dark:border-slate-800/60 border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/sds" className="flex items-center">
          <SdsLogo />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white text-slate-600 hover:text-slate-900 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right Action Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <a
            href="#waitlist"
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-[#2563FF] hover:bg-[#1D4ED8] text-white shadow-lg shadow-[#2563FF]/20 transition-all hover:scale-[1.02]"
          >
            Request Early Access
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-slate-800 dark:border-slate-800 border-slate-200 bg-[#020617] dark:bg-[#020617] bg-white overflow-hidden px-4 py-4 space-y-3"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-slate-300 dark:text-slate-300 text-slate-700 hover:text-[#2563FF]"
              >
                {link.name}
              </a>
            ))}
            <a
              href="#waitlist"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center text-xs font-semibold px-4 py-2.5 rounded-lg bg-[#2563FF] text-white"
            >
              Request Early Access
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}