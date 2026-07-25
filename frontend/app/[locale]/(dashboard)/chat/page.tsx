'use client';
import { useEffect, useState } from 'react';
import { MessageSquare, Bot, Send, RotateCcw, Sparkles, ChevronDown } from 'lucide-react';
import sdsService from '@/services/sdsService';
import chatService from '@/services/chatService';
import { useLocale } from '@/hooks/useLocale';
import ReactMarkdown from 'react-markdown';

interface Message { role: 'user' | 'assistant'; content: string; timestamp: Date; }

const EXAMPLES = [
  'What PPE is required for handling this chemical?',
  'What are the emergency procedures for skin contact?',
  'Is this substance flammable? What is the flash point?',
  'What are the first aid measures for inhalation?',
  'How should this chemical be stored?',
  'What are the health hazards with long-term exposure?',
  'What should I do if there is a large spill?',
  'Is this substance toxic to aquatic life?',
];

export default function ChatPage() {
  const { locale } = useLocale();
  const [sdsList, setSdsList] = useState<any[]>([]);
  const [selectedSds, setSelectedSds] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sdsLoading, setSdsLoading] = useState(true);

  useEffect(() => {
    sdsService.getAll({ status: 'approved', limit: 100 })
      .then(r => setSdsList(r.data.data || []))
      .finally(() => setSdsLoading(false));
  }, []);

  const selectSds = async (sds: any) => {
    setSelectedSds(sds);
    setMessages([]);
    setSessionId(null);
    // Load existing history
    try {
      const { data } = await chatService.getHistory(sds.id);
      if (data.data.messages?.length) {
        setMessages(data.data.messages.map((m: any) => ({ ...m, timestamp: new Date(m.created_at) })));
        if (data.data.sessions?.[0]) setSessionId(data.data.sessions[0].id);
      }
    } catch {}
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedSds || loading) return;
    const userMsg: Message = { role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages(p => [...p, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await chatService.sendMessage({ sdsId: selectedSds.id, message: userMsg.content, sessionId: sessionId || undefined });
      setMessages(p => [...p, { role: 'assistant', content: data.data.message, timestamp: new Date() }]);
      if (!sessionId) setSessionId(data.data.sessionId);
    } catch {
      setMessages(p => [...p, { role: 'assistant', content: '❌ I encountered an error. Please try again.', timestamp: new Date() }]);
    } finally { setLoading(false); }
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const clearChat = () => { setMessages([]); setSessionId(null); };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Left sidebar — SDS selector */}
      <div className="w-72 border-r border-gray-100 flex flex-col bg-gray-50">
        <div className="px-4 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Bot size={16} className="text-gray-600" /> SDS Assistant
          </h2>
          <p className="text-xs text-gray-500 mt-1">Select a document to start asking questions</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {sdsLoading ? (
            <p className="text-xs text-gray-400 text-center py-8">Loading documents...</p>
          ) : sdsList.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">No approved SDS documents.<br />Generate or approve an SDS first.</p>
          ) : sdsList.map(sds => (
            <button key={sds.id} onClick={() => selectSds(sds)}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${selectedSds?.id === sds.id ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
              <p className={`text-xs font-medium truncate ${selectedSds?.id === sds.id ? 'text-white' : 'text-gray-900'}`}>
                {sds.chemicalName || sds.chemical_name}
              </p>
              {(sds.casNumber || sds.cas_number) && (
                <p className={`text-xs mt-0.5 ${selectedSds?.id === sds.id ? 'text-gray-300' : 'text-gray-500'}`}>
                  CAS: {sds.casNumber || sds.cas_number}
                </p>
              )}
            </button>
          ))}
        </div>

        {/* Info */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs font-medium text-blue-800 mb-1 flex items-center gap-1"><Sparkles size={11} /> Powered by GPT-4o</p>
            <p className="text-xs text-blue-700">Answers are based solely on the selected SDS document. Always verify with your EHS manager.</p>
          </div>
        </div>
      </div>

      {/* Right — chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {selectedSds ? (selectedSds.chemicalName || selectedSds.chemical_name) : 'Select a document'}
            </p>
            {selectedSds && <p className="text-xs text-gray-500">AI safety assistant — ask anything about this SDS</p>}
          </div>
          {messages.length > 0 && (
            <button onClick={clearChat} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">
              <RotateCcw size={11} /> New chat
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!selectedSds ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare size={24} className="text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">SDS AI Assistant</h3>
              <p className="text-sm text-gray-500 max-w-xs">Select an approved SDS from the sidebar to start asking questions about hazards, PPE, emergency procedures, and more.</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center mb-4">
                <Bot size={22} className="text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-800 mb-1">SafeBot is ready</p>
              <p className="text-xs text-gray-500 mb-6">Ask me anything about <strong>{selectedSds.chemicalName || selectedSds.chemical_name}</strong></p>
              <div className="grid grid-cols-2 gap-2 max-w-lg w-full">
                {EXAMPLES.slice(0, 6).map((ex, i) => (
                  <button key={i} onClick={() => { setInput(ex); setTimeout(() => sendMessage(), 50); }}
                    className="text-left text-xs px-3 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-600 transition-colors">
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-[fadeInUp_0.2s_ease-out]`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-1 mr-2">
                      <Bot size={13} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-gray-900 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                    {msg.role === 'user' ? (
                      <p>{msg.content}</p>
                    ) : (
                      <ReactMarkdown components={{
                        p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside my-1 space-y-0.5">{children}</ul>,
                        li: ({ children }) => <li className="text-sm">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        code: ({ children }) => <code className="bg-white/20 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                      }}>
                        {msg.content}
                      </ReactMarkdown>
                    )}
                    <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-gray-300' : 'text-gray-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 justify-start">
                  <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center mr-2"><Bot size={13} className="text-white" /></div>
                  <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Input */}
        {selectedSds && (
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-end gap-2 bg-gray-50 rounded-2xl border border-gray-200 p-3">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about PPE, hazards, emergency procedures, storage conditions..."
                rows={1}
                disabled={loading}
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 resize-none focus:outline-none min-h-[24px] max-h-[120px]"
                style={{ height: 'auto' }}
                onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }}
              />
              <button onClick={sendMessage} disabled={!input.trim() || loading}
                className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0 disabled:bg-gray-300 transition-colors hover:bg-gray-700 active:scale-95">
                <Send size={14} className="text-white" />
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              Answers based on SDS data only · Verify critical decisions with your EHS manager · Press Enter to send
            </p>
          </div>
        )}
      </div>
    </div>
  );
}