'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Wand2, Upload } from 'lucide-react';
import { useSds } from '@/hooks/useSds';
import { useLocale } from '@/hooks/useLocale';
import SdsLibraryTable from '@/components/sds/SdsLibraryTable';
import Button from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';

export default function SdsLibraryPage() {
  const { list, total, isLoading, fetchAll, exportPdf, deleteSds } = useSds();
  const { locale } = useLocale();
  const [search, setSearch] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAll({ q: search });
  };

  if (isLoading && !list.length) return <PageSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">SDS Library</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} documents</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/${locale}/sds/generate`}><Button leftIcon={<Wand2 size={14} />}>Generate SDS</Button></Link>
          <Link href={`/${locale}/sds/upload`}><Button variant="secondary" leftIcon={<Upload size={14} />}>Upload</Button></Link>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by chemical name, CAS number, or product code..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400" />
        </div>
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <SdsLibraryTable items={list} locale={locale} />
      </div>
    </div>
  );
}
