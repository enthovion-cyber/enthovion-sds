'use client';
import Link from 'next/link';
import { Wand2, Upload, MoreHorizontal } from 'lucide-react';
import Button from '@/components/ui/Button';

interface Props {
  total: number;
  locale: string;
}

export default function SdsLibraryHeader({ total, locale }: Props) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">SDS Library</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage, validate, approve, publish, and distribute controlled SDS documents.
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {total} records
          </span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" className="hidden sm:flex">
          <MoreHorizontal size={16} />
        </Button>
        <Link href={`/${locale}/sds/upload`}>
          <Button variant="secondary" leftIcon={<Upload size={14} />}>Upload</Button>
        </Link>
        <Link href={`/${locale}/sds/generate`}>
          <Button leftIcon={<Wand2 size={14} />}>Generate SDS</Button>
        </Link>
      </div>
    </div>
  );
}
