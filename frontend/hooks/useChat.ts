'use client';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useChatStore } from '@/store/chatStore';
import chatService from '@/services/chatService';

export const useChat = (sdsId?: string) => {
  const { messages, isLoading, currentSessionId, isOpen, setMessages, addMessage, setSessionId, setLoading, setOpen, setActiveSdsId, clearChat } = useChatStore();

  useEffect(() => {
    if (sdsId) {
      setActiveSdsId(sdsId);
      loadHistory(sdsId);
    }
  }, [sdsId]);

  const loadHistory = async (id: string) => {
    try {
      const { data } = await chatService.getHistory(id);
      setMessages(data.data.messages || []);
      if (data.data.sessions?.[0]) setSessionId(data.data.sessions[0].id);
    } catch {}
  };

  const sendMessage = async (text: string, language = 'en') => {
    if (!sdsId || !text.trim()) return;

    const userMsg = { role: 'user' as const, content: text };
    addMessage(userMsg);
    setLoading(true);

    try {
      const { data } = await chatService.sendMessage({
        sdsId,
        message: text,
        sessionId: currentSessionId || undefined,
        language,
      });
      addMessage({
        role: 'assistant',
        content: data.data.message,
        structured: data.data.structured || null,
        autoFixAvailable: Boolean(data.data.autoFixAvailable),
        model: data.data.model,
      });
      if (!currentSessionId) setSessionId(data.data.sessionId);
    } catch (err: any) {
      toast.error('Chat failed. Please try again.');
      addMessage({ role: 'assistant', content: 'I encountered an error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const openChat = () => setOpen(true);
  const closeChat = () => setOpen(false);

  return { messages, isLoading, isOpen, sendMessage, openChat, closeChat, clearChat };
};
