'use client';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useSdsStore } from '@/store/sdsStore';
import sdsService from '@/services/sdsService';

const mapSdsLibraryItem = (s: any) => ({
  id: s.id,
  tenantId: s.user_id,
  productId: s.product_id,
  productName: s.chemical_name,
  productCode: s.product_code,
  documentTitle: s.chemical_name,
  sdsIdentifier: s.id, // using id as identifier for now
  documentType: 'mixture',
  version: s.version || 1,
  isCurrentVersion: true,
  isCurrentPublishedVersion: s.publication_status === 'published',
  hasNewerDraft: false,
  jurisdictionCode: s.jurisdiction,
  jurisdictionName: s.jurisdiction,
  languageCode: s.language,
  languageName: s.language,
  lifecycleStatus: s.lifecycle_status || s.status || 'draft',
  publicationStatus: s.publication_status || 'not_published',
  complianceScore: s.compliance_score,
  complianceStatus: s.compliance_score < 50 ? 'critical' : s.compliance_score < 75 ? 'major_gaps' : s.compliance_score < 90 ? 'acceptable' : 'strong',
  validationStatus: s.validation_status || 'not_validated',
  issueCounts: s.issue_counts || { critical: 0, major: 0, minor: 0, info: 0 },
  sourceQuality: s.source_quality,
  owner: s.users ? { name: s.users.name, email: s.users.email } : null,
  effectiveAt: s.published_at,
  reviewAt: s.review_date,
  expiresAt: s.expires_at,
  publishedAt: s.published_at,
  updatedAt: s.updated_at,
  createdAt: s.created_at,
  tags: [],
  permissions: {
    canRead: true,
    canEditDraft: true,
    canSubmit: true,
    canApprove: true,
    canPublish: true,
    canDownload: true,
  }
});

export const useSdsLibrary = () => {
  const [list, setList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAll = useCallback(async (params?: Record<string, unknown>) => {
    setIsLoading(true);
    try {
      const { data } = await sdsService.getAll(params);
      setList((data.data || []).map(mapSdsLibraryItem));
      setTotal(data.meta?.total || 0);
    } catch {
      toast.error('Failed to load SDS library');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      // Assuming sdsService has getLibrarySummary endpoint setup
      const res = await fetch('/api/v1/sds/library-summary', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  return { list, total, summary, isLoading, fetchAll, fetchSummary };
};
