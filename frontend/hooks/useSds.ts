'use client';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useSdsStore } from '@/store/sdsStore';
import sdsService from '@/services/sdsService';
import type { GenerateSdsInput } from '@/types/sds.types';

const mapSds = (s: any) => ({
  id: s.id,
  chemicalName: s.chemical_name,
  casNumber: s.cas_number,
  jurisdiction: s.jurisdiction,
  version: s.version || 1,
  language: s.language,
  status: s.status,
  complianceScore: s.compliance_score,
  createdAt: s.created_at || s.updated_at,
  updatedAt: s.updated_at,
  sections: s.sections, // keep for detail page
});

const cleanGenerateInput = (input: GenerateSdsInput) => {
  const cleaned = Object.entries(input).reduce((acc, [key, value]) => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        (acc as Record<string, unknown>)[key] = trimmed;
      }
      return acc;
    }
    if (value !== undefined && value !== null) {
      (acc as Record<string, unknown>)[key] = value;
    }
    return acc;
  }, {} as Partial<GenerateSdsInput>);

  return cleaned as GenerateSdsInput;
};

export const useSds = () => {
  const { list, current, stats, total, isLoading, setList, setCurrent, setStats, setLoading, removeSds } = useSdsStore();

  const fetchAll = useCallback(async (params?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const { data } = await sdsService.getAll(params);
      const mapped = (data.data || []).map(mapSds);
setList(mapped, data.meta?.total || 0);
    } catch {
      toast.error('Failed to load SDS library');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { data } = await sdsService.getById(id);
      const s = data.data;
setCurrent(mapSds(s));
    } catch {
      toast.error('SDS not found');
    } finally {
      setLoading(false);
    }
  }, []);

  const generate = async (input: GenerateSdsInput) => {
    setLoading(true);
    try {
      const payload = cleanGenerateInput(input);
      const { data } = await sdsService.generate(payload);
      toast.success('SDS generated successfully');
      return data.data;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Generation failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const upload = async (file: File) => {
    setLoading(true);
    try {
      const { data } = await sdsService.upload(file);
      toast.success('Document uploaded and extracted');
      return data.data;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Upload failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id: string) => {
    try {
      await sdsService.approve(id);
      toast.success('SDS approved and published');
      await fetchById(id);
    } catch {
      toast.error('Approval failed');
    }
  };

  const exportPdf = async (id: string, name: string) => {
    try {
      const { data } = await sdsService.export(id);
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `SDS_${name}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Export failed');
    }
  };

  const deleteSds = async (id: string) => {
    try {
      await sdsService.delete(id);
      removeSds(id);
      toast.success('SDS deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await sdsService.getDashboardStats();
      setStats(data.data);
    } catch {}
  }, []);

  return { list, current, stats, total, isLoading, fetchAll, fetchById, generate, upload, approve, exportPdf, deleteSds, fetchStats };
};
