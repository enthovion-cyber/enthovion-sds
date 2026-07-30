'use client';
import { FileText, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface Props {
  summary: any;
  onFilterClick: (filter: any) => void;
}

export default function SdsLibrarySummary({ summary, onFilterClick }: Props) {
  if (!summary) return <div className="h-20 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl mb-6" />;

  const stats = [
    { label: 'Active SDS', value: summary.total, icon: FileText, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Published', value: summary.published, icon: CheckCircle, color: 'text-green-600 dark:text-green-400', filter: { publication_status: 'published' } },
    { label: 'Awaiting Review', value: summary.awaitingReview, icon: Clock, color: 'text-amber-600 dark:text-amber-400', filter: { status: 'submitted,technical_review' } },
    { label: 'Critical Issues', value: summary.criticalIssues, icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', filter: { compliance_status: 'critical' } },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, i) => (
        <div 
          key={i} 
          onClick={() => stat.filter && onFilterClick(stat.filter)}
          className={`p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between ${stat.filter ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors' : ''}`}
        >
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">{stat.value}</p>
          </div>
          <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color}`}>
            <stat.icon size={20} />
          </div>
        </div>
      ))}
    </div>
  );
}
