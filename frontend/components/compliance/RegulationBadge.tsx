'use client';
export default function RegulationBadge({ reference }: { reference?: string }) {
  if (!reference) return null;
  return (
    <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded font-mono flex-shrink-0 max-w-[120px] truncate" title={reference}>
      {reference}
    </span>
  );
}
