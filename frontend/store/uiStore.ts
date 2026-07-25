'use client';
import { create } from 'zustand';

interface UiStore {
  isSidebarOpen: boolean;
  isPageLoading: boolean;
  toggleSidebar: () => void;
  setPageLoading: (v: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  isSidebarOpen: true,
  isPageLoading: false,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setPageLoading: (v) => set({ isPageLoading: v }),
}));
