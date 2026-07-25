'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import complianceService from '@/services/complianceService';
import { type Jurisdiction } from '@/utils/constants';

export interface ComplianceReport {
  score: number;
  audited?: number;
  [key: string]: any; 
}

export const useCompliance = () => {
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Audit single SDS
  const auditSds = useCallback(async (id: string, jurisdiction: Jurisdiction = 'US_OSHA') => {
    setIsLoading(true);
    try {
      const { data } = await complianceService.auditSds(id, jurisdiction);
      setReport(data.data);
      toast.success(`Audit complete — Score: ${data.data.score}/100`);
      return data.data;
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Audit failed';
      toast.error(errMsg);
      throw err;
    } finally { 
      setIsLoading(false); 
    }
  }, []);

  // 2. Audit entire Library
  const auditLibrary = useCallback(async (jurisdiction: Jurisdiction = 'US_OSHA') => {
    setIsLoading(true);
    try {
      const { data } = await complianceService.auditLibrary(jurisdiction);
      toast.success(`Library audit complete — ${data.data.audited || 0} documents audited`);
      return data.data;
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Library audit failed';
      toast.error(errMsg);
      throw err;
    } finally { 
      setIsLoading(false); 
    }
  }, []);

  // 3. Fetch existing compliance report
  const fetchReport = useCallback(async (sdsId: string, jurisdiction?: Jurisdiction) => {
    setIsLoading(true);
    try {
      const { data } = await complianceService.getReport(sdsId, jurisdiction);
      setReport(data.data);
      return data.data;
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Failed to fetch report';
      toast.error(errMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 4. Load Auto-Fix Preview (Added missing hook method)
  const getAutoFixPreview = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const { data } = await complianceService.getAutoFixPreview(id);
      toast.success('Auto-fix preview ready');
      return data.data;
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Unable to generate auto-fix preview';
      toast.error(errMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 5. Trigger Auto-Fix Workflow
  const triggerAutoFix = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const { data } = await complianceService.startAutoFixWorkflow(id);
      toast.success('Auto-fix workflow initiated successfully.');
      return data.data;
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Failed to start auto-fix';
      toast.error(errMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { 
    report, 
    isLoading, 
    auditSds, 
    auditLibrary, 
    fetchReport,
    getAutoFixPreview,
    triggerAutoFix
  };
};