'use client';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, XCircle, FileText } from 'lucide-react';

interface Props {
  items: any[];
  locale: string;
}

export default function SdsTable({ items, locale }: Props) {
  if (!items.length) {
    return (
      <div className="text-center py-16 text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-sm font-medium text-slate-900 dark:text-white">No SDS documents found</h3>
        <p className="text-sm mt-1">Check your search terms or active filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden overflow-x-auto shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th className="py-3 px-4 font-medium whitespace-nowrap">Product</th>
            <th className="py-3 px-4 font-medium whitespace-nowrap">Version</th>
            <th className="py-3 px-4 font-medium whitespace-nowrap">Status</th>
            <th className="py-3 px-4 font-medium whitespace-nowrap">Compliance</th>
            <th className="py-3 px-4 font-medium whitespace-nowrap">Validation</th>
            <th className="py-3 px-4 font-medium whitespace-nowrap text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {items.map((sds) => (
            <tr key={sds.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td className="py-3 px-4">
                <div className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">{sds.productName}</div>
                <div className="text-xs text-slate-500">{sds.sdsIdentifier.substring(0,8)} • {sds.jurisdictionCode} ({sds.languageCode})</div>
              </td>
              <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                v{sds.version}.0
                {sds.isCurrentPublishedVersion && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded">Published</span>}
              </td>
              <td className="py-3 px-4">
                <span className="capitalize px-2 py-1 text-xs rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {sds.lifecycleStatus.replace('_', ' ')}
                </span>
              </td>
              <td className="py-3 px-4">
                {sds.complianceScore ? (
                   <span className={`px-2 py-1 text-xs rounded-md ${sds.complianceScore < 50 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : sds.complianceScore < 75 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                     {sds.complianceScore}%
                   </span>
                ) : <span className="text-slate-400">—</span>}
              </td>
              <td className="py-3 px-4">
                {sds.validationStatus === 'passed' ? <CheckCircle2 size={16} className="text-green-500" /> : 
                 sds.validationStatus === 'warning' ? <AlertCircle size={16} className="text-amber-500" /> :
                 sds.validationStatus === 'failed' ? <XCircle size={16} className="text-red-500" /> :
                 <span className="text-slate-400">—</span>}
              </td>
              <td className="py-3 px-4 text-right">
                <Link href={`/${locale}/sds/${sds.id}`} className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">Open</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
