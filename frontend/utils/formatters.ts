import { COMPLIANCE_THRESHOLDS } from './constants';

export const formatDate = (dateStr?: string | null, locale = 'en-GB'): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatRelative = (dateStr?: string | null): string => {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
};

export const getDaysUntilExpiry = (expiresAt?: string | null): number | null => {
  if (!expiresAt) return null;
  return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000);
};

export const getComplianceColor = (score?: number | null): string => {
  if (score == null) return 'text-gray-400';
  if (score >= COMPLIANCE_THRESHOLDS.compliant)   return 'text-green-600';
  if (score >= COMPLIANCE_THRESHOLDS.acceptable)  return 'text-blue-600';
  if (score >= COMPLIANCE_THRESHOLDS.needsUpdate) return 'text-amber-600';
  return 'text-red-600';
};

export const getComplianceBg = (score?: number | null): string => {
  if (score == null) return 'bg-gray-100 text-gray-600';
  if (score >= COMPLIANCE_THRESHOLDS.compliant)   return 'bg-green-100 text-green-800';
  if (score >= COMPLIANCE_THRESHOLDS.acceptable)  return 'bg-blue-100 text-blue-800';
  if (score >= COMPLIANCE_THRESHOLDS.needsUpdate) return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
};

export const getStatusBadgeClass = (status: string): string => {
  const map: Record<string, string> = {
    approved:       'bg-green-100 text-green-800',
    draft:          'bg-gray-100 text-gray-700',
    pending_review: 'bg-amber-100 text-amber-800',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
};

export const truncate = (str: string, n = 40): string =>
  str.length > n ? str.slice(0, n - 3) + '...' : str;
