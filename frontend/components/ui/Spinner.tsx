'use client';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={clsx('animate-spin text-gray-500', className)} />;
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner size={32} />
    </div>
  );
}
