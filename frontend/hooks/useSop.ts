'use client';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useSopStore } from '@/store/sopStore';
import sopService from '@/services/sopService';
import type { GenerateSopInput } from '@/types/sop.types';

export const useSop = () => {
  const { list, current, total, isLoading, setList, setCurrent, setLoading } = useSopStore();

  const fetchAll = useCallback(async (params?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const { data } = await sopService.getAll(params);
      setList(data.data || [], data.meta?.total || 0);
    } catch { toast.error('Failed to load SOPs'); }
    finally { setLoading(false); }
  }, []);

  const fetchById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { data } = await sopService.getById(id);
      setCurrent(data.data);
    } catch { toast.error('SOP not found'); }
    finally { setLoading(false); }
  }, []);

  const generate = async (input: GenerateSopInput) => {
    setLoading(true);
    try {
      const { data } = await sopService.generate(input);
      toast.success('SOP generated successfully');
      return data.data;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'SOP generation failed');
      throw err;
    } finally { setLoading(false); }
  };

  const exportPdf = async (id: string, type: string, lang: string) => {
    try {
      const { data } = await sopService.export(id);
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `SOP_${type}_${lang}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Export failed'); }
  };

  return { list, current, total, isLoading, fetchAll, fetchById, generate, exportPdf };
};
