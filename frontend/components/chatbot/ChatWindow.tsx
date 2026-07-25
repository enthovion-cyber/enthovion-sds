'use client';
import { useEffect, useRef } from 'react';
import { X, MessageSquare } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { useChat } from '@/hooks/useChat';
import Spinner from '@/components/ui/Spinner';
import complianceService from '@/services/complianceService';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/hooks/useLocale';

interface Props { sdsId: string; chemicalName: string; onClose: () => void; }

const EXAMPLES = [
  'Is this SDS compliant in EU_CLP? Explain why.',
  'Which section is weakest and how do I fix it?',
  'Create an action plan before audit approval.',
  'What PPE and emergency steps are mandatory?',
];

export default function ChatWindow({ sdsId, chemicalName, onClose }: Props) {
  const { messages, isLoading, sendMessage } = useChat(sdsId);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { locale } = useLocale();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startAutoFix = async () => {
    try {
      const { data } = await complianceService.startAutoFixWorkflow(sdsId);
      toast.success(`Auto-fix started (${data.data.id.slice(0, 8)})`);
      onClose();
      router.push(`/${locale}/pipeline?taskId=${data.data.id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to start auto-fix workflow');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white">
        <div className="flex items-center gap-2">
          <MessageSquare size={15} />
          <div>
            <p className="text-sm font-semibold">Compliance Copilot</p>
            <p className="text-xs text-gray-300 truncate max-w-[200px]">{chemicalName}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-300 hover:text-white transition-colors p-1 rounded">
          <X size={15} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare size={18} className="text-gray-500" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">Ask compliance questions about this SDS</p>
            <p className="text-xs text-gray-500 mb-4">I respond with decision, reasoning, and corrective action you can run</p>
            <div className="flex flex-col gap-2">
              {EXAMPLES.map((ex) => (
                <button key={ex} onClick={() => sendMessage(ex)}
                  className="text-xs text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors border border-gray-100">
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            message={msg}
            onAutoFix={msg.role === 'assistant' && msg.autoFixAvailable ? startAutoFix : undefined}
          />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 px-3 py-2">
            <Spinner size={14} />
            <span className="text-xs text-gray-500">SafeBot is thinking...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} isLoading={isLoading} />
    </div>
  );
}
