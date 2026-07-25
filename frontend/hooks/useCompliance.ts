'use client';
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import complianceService from '@/services/complianceService';

export interface ComplianceReport {
  score: number;
  audited?: number;
  [key: string]: any; 
}

export const useCompliance = () => {
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const auditSds = useCallback(async (id: string, jurisdiction = 'US_OSHA') => {
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

  const auditLibrary = useCallback(async (jurisdiction = 'US_OSHA') => {
    setIsLoading(true);
    try {
      const { data } = await complianceService.auditLibrary(jurisdiction);
      toast.success(`Library audit complete — ${data.data.audited} documents audited`);
      return data.data;
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Library audit failed';
      toast.error(errMsg);
      throw err;
    } finally { 
      setIsLoading(false); 
    }
  }, []);

  const fetchReport = useCallback(async (sdsId: string, jurisdiction?: string) => {
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
    triggerAutoFix
  };
};