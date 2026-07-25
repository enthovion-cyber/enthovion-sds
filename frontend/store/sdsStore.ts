'use client';
import { create } from 'zustand';
import type { SdsListItem, SdsDocument, SdsDashboardStats } from '@/types/sds.types';

interface SdsStore {
  list: SdsListItem[];
  current: SdsDocument | null;
  stats: SdsDashboardStats | null;
  total: number;
  isLoading: boolean;
  setList: (items: SdsListItem[], total: number) => void;
  setCurrent: (sds: SdsDocument | null) => void;
  setStats: (stats: SdsDashboardStats) => void;
  setLoading: (v: boolean) => void;
  removeSds: (id: string) => void;
  updateSdsInList: (sds: SdsListItem) => void;
}

export const useSdsStore = create<SdsStore>((set) => ({
  list: [],
  current: null,
  stats: null,
  total: 0,
  isLoading: false,
  setList: (items, total) => set({ list: items, total }),
  setCurrent: (sds) => set({ current: sds }),
  setStats: (stats) => set({ stats }),
  setLoading: (v) => set({ isLoading: v }),
  removeSds: (id) => set((s) => ({ list: s.list.filter((x) => x.id !== id) })),
  updateSdsInList: (sds) =>
    set((s) => ({ list: s.list.map((x) => (x.id === sds.id ? { ...x, ...sds } : x)) })),
}));
