'use client';
import { clsx } from 'clsx';

type BadgeVariant = 'gray' | 'green' | 'red' | 'amber' | 'blue' | 'purple';
const variantMap: Record<BadgeVariant, string> = {
  gray:   'bg-gray-100 text-gray-700',
  green:  'bg-green-100 text-green-800',
  red:    'bg-red-100 text-red-800',
  amber:  'bg-amber-100 text-amber-800',
  blue:   'bg-blue-100 text-blue-800',
  purple: 'bg-purple-100 text-purple-800',
};

export default function Badge({ children, variant = 'gray', className }: {
  children: React.ReactNode; variant?: BadgeVariant; className?: string;
}) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', variantMap[variant], className)}>
      {children}
    </span>
  );
}
