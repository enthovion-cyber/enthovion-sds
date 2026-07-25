'use client';
import { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import ChatWindow from './ChatWindow';

interface Props { sdsId: string; chemicalName: string; }

export default function SdsChatbot({ sdsId, chemicalName }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="absolute bottom-16 right-0 w-96 h-[520px] shadow-2xl rounded-2xl overflow-hidden">
          <ChatWindow sdsId={sdsId} chemicalName={chemicalName} onClose={() => setOpen(false)} />
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-13 h-13 w-14 h-14 bg-gray-900 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-700 transition-all hover:scale-105 active:scale-95"
        title="Open Compliance Copilot"
      >
        {open ? <X size={20} /> : <MessageSquare size={20} />}
      </button>
    </div>
  );
}
