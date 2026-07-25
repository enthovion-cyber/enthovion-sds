'use client';
import { create } from 'zustand';
import type { SopDocument } from '@/types/sop.types';

interface SopStore {
  list: SopDocument[];
  current: SopDocument | null;
  total: number;
  isLoading: boolean;
  setList: (items: SopDocument[], total: number) => void;
  setCurrent: (sop: SopDocument | null) => void;
  setLoading: (v: boolean) => void;
}

export const useSopStore = create<SopStore>((set) => ({
  list: [],
  current: null,
  total: 0,
  isLoading: false,
  setList: (items, total) => set({ list: items, total }),
  setCurrent: (sop) => set({ current: sop }),
  setLoading: (v) => set({ isLoading: v }),
}));
