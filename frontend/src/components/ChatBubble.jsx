import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

const INITIAL_MESSAGES = [
  {
    role: 'assistant',
    text: "Hey! I'm GooBot — your witty deal-finder. Ask me something like \"Best gaming phone under ₹40k\" and I'll scan live prices for you.",
  },
];

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || isThinking) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setIsThinking(true);

    try {
      const res = await fetch(`${API_URL}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: 'Network hiccup! Check the backend and try again.' },
      ]);
    } finally {
      setIsThinking(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* ── Chat Window ───────────────────────────────── */}
      {isOpen && (
        <div
          className="w-80 sm:w-96 bg-surface border border-white/20 flex flex-col shadow-2xl"
          style={{ height: '480px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/20 shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare size={13} className="text-accent" />
              <span className="font-mono text-[10px] tracking-[0.25em] text-white uppercase">
                GooDeals AI
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X size={13} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 scrollbar-none">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] px-3 py-2 font-mono text-[11px] leading-relaxed tracking-wide whitespace-pre-wrap
                    ${msg.role === 'user'
                      ? 'bg-white text-surface'
                      : 'bg-white/5 border border-white/10 text-white'
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 px-3 py-2 font-mono text-[10px] text-muted tracking-[0.2em]">
                  THINKING...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center border-t border-white/20 px-3 py-2 gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ASK GOOBOT..."
              className="flex-1 bg-transparent font-mono text-[11px] text-white placeholder:text-muted
                         focus:outline-none tracking-wider"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isThinking}
              className="text-accent hover:text-white transition-colors disabled:opacity-30 shrink-0"
              aria-label="Send message"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}

      {/* ── Floating Toggle Button ────────────────────── */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-12 h-12 bg-surface border border-white/30 flex items-center justify-center
                   hover:border-white hover:bg-white/5 transition-all shadow-lg"
        aria-label={isOpen ? 'Close GooBot' : 'Open GooBot'}
      >
        {isOpen
          ? <X size={17} className="text-white" />
          : <MessageSquare size={17} className="text-accent" />
        }
      </button>
    </div>
  );
}
