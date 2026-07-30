'use client';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import Button from '@/components/ui/Button';

interface Props {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onClear: () => void;
}

export default function SdsLibrarySearch({ searchQuery, onSearchChange, onClear }: Props) {
  return (
    <div className="flex gap-2 mb-4">
      <div className="relative flex-1 max-w-xl">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products, CAS numbers, suppliers, SDS IDs…"
          className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
        />
        {searchQuery && (
          <button onClick={onClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X size={16} />
          </button>
        )}
      </div>
      <Button variant="secondary" leftIcon={<SlidersHorizontal size={14} />}>
        Filters
      </Button>
    </div>
  );
}
