'use client';
import { useEffect, useState } from 'react';
import { useSdsLibrary } from '@/hooks/useSdsLibrary';
import { useLocale } from '@/hooks/useLocale';
import SdsLibraryHeader from '@/components/sds-library/SdsLibraryHeader';
import SdsLibrarySummary from '@/components/sds-library/SdsLibrarySummary';
import SdsLibrarySearch from '@/components/sds-library/SdsLibrarySearch';
import SdsTable from '@/components/sds-library/SdsTable';
import { PageSpinner } from '@/components/ui/Spinner';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export default function SdsLibraryPage() {
  const { list, total, summary, isLoading, fetchAll, fetchSummary } = useSdsLibrary();
  const { locale } = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState(searchParams.get('search') || '');

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    fetchAll(params);
  }, [searchParams, fetchAll]);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null) current.delete(key);
      else current.set(key, value);
    });
    router.push(`${pathname}?${current.toString()}`);
  };

  const handleSearchSubmit = (val: string) => {
    setSearch(val);
    updateFilters({ search: val || null });
  };

  const handleClearSearch = () => {
    setSearch('');
    updateFilters({ search: null });
  };

  if (isLoading && !list.length) return <PageSpinner />;

  return (
    <div className="max-w-[1600px] mx-auto pb-12">
      <SdsLibraryHeader total={total} locale={locale} />
      <SdsLibrarySummary summary={summary} onFilterClick={(f) => updateFilters(f)} />
      <SdsLibrarySearch 
        searchQuery={search} 
        onSearchChange={setSearch} 
        onClear={handleClearSearch}
      />
      
      <div className="mt-4">
        <SdsTable items={list} locale={locale} />
      </div>
    </div>
  );
}
