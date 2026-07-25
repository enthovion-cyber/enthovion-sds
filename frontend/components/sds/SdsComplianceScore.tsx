'use client';

export default function SdsComplianceScore({ score }: { score?: number | null }) {
  if (score == null) return <div className="text-sm text-gray-400">Not audited yet</div>;

  const color = score >= 90 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626';
  const label = score >= 90 ? 'Compliant' : score >= 60 ? 'Needs update' : 'Critical gaps';
  const r = 36, cx = 44, cy = 44, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="flex items-center gap-4">
      <svg width="88" height="88" className="-rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div>
        <p className="text-2xl font-bold" style={{ color }}>{score}</p>
        <p className="text-xs text-gray-500">/100 — {label}</p>
      </div>
    </div>
  );
}
