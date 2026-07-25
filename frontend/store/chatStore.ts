'use client';
import { create } from 'zustand';
import type { ChatMessage, ChatSession } from '@/types/chat.types';

interface ChatStore {
  messages: ChatMessage[];
  sessions: ChatSession[];
  currentSessionId: string | null;
  isOpen: boolean;
  isLoading: boolean;
  activeSdsId: string | null;
  addMessage: (msg: ChatMessage) => void;
  setMessages: (msgs: ChatMessage[]) => void;
  setSessions: (sessions: ChatSession[]) => void;
  setSessionId: (id: string | null) => void;
  setOpen: (v: boolean) => void;
  setLoading: (v: boolean) => void;
  setActiveSdsId: (id: string | null) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  sessions: [],
  currentSessionId: null,
  isOpen: false,
  isLoading: false,
  activeSdsId: null,
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setMessages: (msgs) => set({ messages: msgs }),
  setSessions: (sessions) => set({ sessions }),
  setSessionId: (id) => set({ currentSessionId: id }),
  setOpen: (v) => set({ isOpen: v }),
  setLoading: (v) => set({ isLoading: v }),
  setActiveSdsId: (id) => set({ activeSdsId: id }),
  clearChat: () => set({ messages: [], currentSessionId: null }),
}));
