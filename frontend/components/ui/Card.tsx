'use client';
import { clsx } from 'clsx';

export default function Card({ children, className, padding = true }: {
  children: React.ReactNode; className?: string; padding?: boolean;
}) {
  return (
    <div className={clsx('bg-white border border-gray-200 rounded-xl shadow-sm', padding && 'p-5', className)}>
      {children}
    </div>
  );
}
