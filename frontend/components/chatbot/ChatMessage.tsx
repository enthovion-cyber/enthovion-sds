'use client';
import ReactMarkdown from 'react-markdown';
import { clsx } from 'clsx';
import { Sparkles } from 'lucide-react';
import type { ChatMessage as ChatMsg } from '@/types/chat.types';

export default function ChatMessage({
  message,
  onAutoFix,
}: {
  message: ChatMsg;
  onAutoFix?: () => void;
}) {
  const isUser = message.role === 'user';
  return (
    <div className={clsx('flex chat-bubble', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-1 me-2">
          <span className="text-white text-xs font-bold">S</span>
        </div>
      )}
      <div className={clsx(
        'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
        isUser
          ? 'bg-gray-900 text-white rounded-br-sm'
          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
      )}>
        {!isUser && message.structured && (
          <div className="mb-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                <Sparkles size={12} className="text-purple-600" />
                {message.structured.compliance_status || 'Needs review'}
              </p>
              {message.model && <span className="text-[10px] text-gray-400">{message.model}</span>}
            </div>
            {message.structured.reasoning && <p className="text-xs text-gray-600 mt-1">{message.structured.reasoning}</p>}
            {message.structured.fix_suggestion && (
              <p className="text-xs text-gray-800 mt-2">
                <span className="font-semibold text-gray-700">Suggested fix:</span> {message.structured.fix_suggestion}
              </p>
            )}
            {message.autoFixAvailable && onAutoFix && (
              <button
                onClick={onAutoFix}
                className="mt-2 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors"
              >
                Start Auto-fix workflow →
              </button>
            )}
          </div>
        )}
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-inside my-1 space-y-0.5">{children}</ul>,
              li: ({ children }) => <li className="text-sm">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
