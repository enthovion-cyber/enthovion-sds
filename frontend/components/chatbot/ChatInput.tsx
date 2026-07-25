'use client';
import { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface Props { onSend: (msg: string) => void; isLoading: boolean; }

export default function ChatInput({ onSend, isLoading }: Props) {
  const [value, setValue] = useState('');

  const handleSend = () => {
    if (!value.trim() || isLoading) return;
    onSend(value.trim());
    setValue('');
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="border-t border-gray-100 p-3">
      <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 p-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about PPE, hazards, emergency procedures..."
          rows={1}
          disabled={isLoading}
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 resize-none focus:outline-none min-h-[24px] max-h-[80px]"
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || isLoading}
          className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0 disabled:bg-gray-300 transition-colors hover:bg-gray-700"
        >
          <Send size={13} className="text-white" />
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-1.5 text-center">Answers based on SDS data only · Always verify with your EHS manager</p>
    </div>
  );
}
