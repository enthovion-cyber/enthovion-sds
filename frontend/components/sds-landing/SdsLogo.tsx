import React from 'react';

export default function SdsLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Hexagon Frame Icon */}
      <div className="relative w-8 h-8 flex items-center justify-center">
        <svg viewBox="0 0 32 32" className="w-8 h-8 fill-none stroke-[#2563FF]" strokeWidth="2">
          <polygon points="16,2 29,9.5 29,24.5 16,32 3,24.5 3,9.5" className="stroke-[#2563FF] fill-[#071A33]/40" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 16 16" className="w-4 h-4 fill-none stroke-[#00B8D9]" strokeWidth="2">
            <path d="M4 3h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
            <path d="M5 8l2 2 4-4" className="stroke-[#16A34A]" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="flex items-baseline gap-1.5 font-bold tracking-tight">
        <span className="text-slate-900 dark:text-white text-lg font-sans">Enthovion</span>
        <span className="text-[#2563FF] text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-[#2563FF]/10 border border-[#2563FF]/20">
          SDS
        </span>
      </div>
    </div>
  );
}