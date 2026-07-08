import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
const PERSONAS = [
  { id: 'TUTOR', label: 'Tutor', icon: '📘', color: 'bg-blue-500', desc: 'Adaptive learning & explanations' },
  { id: 'ARCHITECT', label: 'Architect', icon: '🏗️', color: 'bg-purple-500', desc: 'System design & tech-debt analysis' },
  { id: 'DEBUGGER', label: 'Debugger', icon: '🐛', color: 'bg-red-500', desc: 'Real-time diagnostics & bug fixes' },
  { id: 'INTERVIEWER', label: 'Interviewer', icon: '🎯', color: 'bg-emerald-500', desc: 'Mock technical interviews' },
];

interface Message { role: 'user' | 'ai'; text: string; }

export default function WorkspaceChat() {
  const [persona, setPersona] = useState('TUTOR');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const data = await api.chat.send(persona, userMsg);
      setMessages(prev => [...prev, { role: 'ai', text: data.response || data.message || 'No response' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: '⚠️ Failed to reach AI service. Check your Gemini API key in the backend config.' }]);
    } finally {
      setLoading(false);
    }
  };

  const selectedPersona = PERSONAS.find(p => p.id === persona)!;

  return (
    <div className="flex h-full overflow-hidden bg-white">
      {/* Persona sidebar */}
      <div className="w-52 border-r border-slate-200 p-3 space-y-1 shrink-0 bg-slate-50">
        <div className="text-xs text-slate-400 uppercase tracking-widest px-2 mb-2 font-semibold">AI Persona</div>
        {PERSONAS.map(p => (
          <button
            key={p.id}
            onClick={() => { setPersona(p.id); setMessages([]); }}
            className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-sm ${
              persona === p.id
                ? 'bg-indigo-500/10 text-indigo-700 border border-indigo-500/20 font-medium'
                : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
            }`}
          >
            <div className="font-semibold">{p.icon} {p.label}</div>
            <div className="text-xs text-slate-500 mt-0.5">{p.desc}</div>
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center gap-3 shadow-sm z-10">
          <div className={`w-8 h-8 rounded-lg ${selectedPersona.color} flex items-center justify-center text-base text-white`}>
            {selectedPersona.icon}
          </div>
          <div>
            <div className="text-slate-900 font-semibold text-sm">{selectedPersona.label}</div>
            <div className="text-slate-500 text-xs">{selectedPersona.desc}</div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-slate-400 text-sm pt-16">
              <div className="text-4xl mb-2">{selectedPersona.icon}</div>
              Start a conversation with {selectedPersona.label}
            </div>
          )}
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex gap-1 pl-2">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-indigo-500 rounded-full"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                />
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200 bg-white flex gap-3">
          <textarea
            className="input-field flex-1 resize-none text-sm min-h-[44px] max-h-28 bg-slate-50 text-slate-800"
            placeholder={`Ask ${selectedPersona.label}...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={1}
          />
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={send}
            disabled={loading || !input.trim()}
            className="btn-primary px-5 self-end"
          >
            ↑
          </motion.button>
        </div>
      </div>
    </div>
  );
}

