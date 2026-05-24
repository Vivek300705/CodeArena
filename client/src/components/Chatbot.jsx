import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, Trash2, Code2 } from 'lucide-react';
import { chatbotService } from '../services/chatbotService';
import { useProblemContextStore } from '../store/useProblemContextStore';

/* ── tiny markdown helpers ─────────────────────────────────── */
function formatMessage(text) {
  if (!text) return '';

  // Escape HTML first
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks (``` ... ```)
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="chat-code-block"><code>${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Line breaks
  html = html.replace(/\n/g, '<br/>');

  return html;
}

/* ── main component ────────────────────────────────────────── */
export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: "Hey! 👋 I'm the CodeArena AI Assistant. Ask me anything about programming, data structures, algorithms, or debugging your code!\n\n💡 **Tip:** Open any problem and I'll automatically see the question and your code!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Read the active problem context from the global store
  const ctxProblem = useProblemContextStore((s) => s.problem);
  const ctxCode = useProblemContextStore((s) => s.code);
  const ctxLanguage = useProblemContextStore((s) => s.language);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      // Small delay to let the animation finish
      const t = setTimeout(() => inputRef.current?.focus(), 350);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg = { role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = [...messages, userMsg];

      // Build the problem context object to send to the backend
      let problemContext = null;
      if (ctxProblem) {
        problemContext = {
          title: ctxProblem.title,
          description: ctxProblem.description,
          difficulty: ctxProblem.difficulty,
          tags: ctxProblem.tags,
          examples: ctxProblem.examples,
          timeLimit: ctxProblem.timeLimit,
          memoryLimit: ctxProblem.memoryLimit,
        };
      }

      const response = await chatbotService.sendMessage(
        trimmed,
        history,
        problemContext,
        ctxCode,
        ctxLanguage
      );
      setMessages((prev) => [...prev, { role: 'model', text: response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: '⚠️ Something went wrong. Please try again later.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'model',
        text: "Chat cleared! 🧹 How can I help you?",
      },
    ]);
  };

  /* ── animations ──────────────────────────────────────────── */
  const panelVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.92 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 320, damping: 28 },
    },
    exit: {
      opacity: 0,
      y: 24,
      scale: 0.92,
      transition: { duration: 0.2 },
    },
  };

  const bubbleVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 400, damping: 25 },
    },
  };

  return (
    <>
      {/* ── Floating Action Button ─────────────────────────── */}
      <motion.button
        id="chatbot-toggle"
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center shadow-lg cursor-pointer group"
        style={{
          background: 'linear-gradient(135deg, #a855f7 0%, #6d28d9 100%)',
          border: '1px solid rgba(168, 85, 247, 0.5)',
        }}
        whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(168,85,247,0.6)' }}
        whileTap={{ scale: 0.92 }}
        aria-label="Toggle chatbot"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={22} className="text-white" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageSquare size={22} className="text-white" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse ring */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-purple-400 pointer-events-none" />
        )}
      </motion.button>

      {/* ── Chat Panel ─────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chatbot-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-24 right-6 z-[9998] w-[380px] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{
              height: 'min(560px, calc(100vh - 8rem))',
              background: 'rgba(13, 13, 20, 0.92)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(168, 85, 247, 0.2)',
              boxShadow:
                '0 0 40px rgba(168, 85, 247, 0.12), 0 25px 50px -12px rgba(0,0,0,0.6)',
            }}
          >
            {/* ── Header ──────────────────────────────────── */}
            <div
              className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{
                background:
                  'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(109,40,217,0.1) 100%)',
                borderBottom: '1px solid rgba(168,85,247,0.15)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                    boxShadow: '0 0 15px rgba(168,85,247,0.4)',
                  }}
                >
                  <Sparkles size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide font-display">
                    AI Assistant
                  </h3>
                  <p className="text-[10px] text-purple-300/80 font-mono tracking-widest uppercase">
                    Online
                  </p>
                </div>
              </div>

              <button
                onClick={clearChat}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-purple-400/60 hover:text-purple-300 hover:bg-purple-500/10 transition-colors cursor-pointer"
                title="Clear chat"
              >
                <Trash2 size={15} />
              </button>
            </div>

            {/* ── Context Indicator ─────────────────────── */}
            {ctxProblem && (
              <div
                className="flex items-center gap-2 px-4 py-2 flex-shrink-0"
                style={{
                  background: 'rgba(0, 245, 255, 0.04)',
                  borderBottom: '1px solid rgba(0, 245, 255, 0.1)',
                }}
              >
                <Code2 size={12} className="text-neon-cyan flex-shrink-0" />
                <p className="text-[10px] text-neon-cyan/80 font-mono tracking-wider truncate">
                  TRACKING: <span className="font-bold text-neon-cyan">{ctxProblem.title}</span>
                </p>
              </div>
            )}

            {/* ── Messages ────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  variants={bubbleVariants}
                  initial="hidden"
                  animate="visible"
                  className={`flex gap-2.5 ${
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5 ${
                      msg.role === 'user'
                        ? 'bg-neon-cyan/15 text-neon-cyan'
                        : 'bg-purple-500/15 text-purple-400'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User size={14} />
                    ) : (
                      <Bot size={14} />
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-neon-cyan/10 text-neon-cyan/90 rounded-tr-sm border border-neon-cyan/15'
                        : 'bg-white/[0.04] text-gray-200 rounded-tl-sm border border-white/[0.06]'
                    }`}
                  >
                    <div
                      className="chat-message-content"
                      dangerouslySetInnerHTML={{
                        __html: formatMessage(msg.text),
                      }}
                    />
                  </div>
                </motion.div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  variants={bubbleVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex gap-2.5"
                >
                  <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5 bg-purple-500/15 text-purple-400">
                    <Bot size={14} />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/[0.04] border border-white/[0.06]">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input Bar ───────────────────────────────── */}
            <div
              className="flex-shrink-0 px-4 pb-4 pt-2"
              style={{
                borderTop: '1px solid rgba(168,85,247,0.1)',
              }}
            >
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(168,85,247,0.15)',
                }}
              >
                <textarea
                  ref={inputRef}
                  id="chatbot-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-500 outline-none resize-none font-mono max-h-24 scrollbar-thin"
                  style={{ lineHeight: '1.6' }}
                />
                <motion.button
                  id="chatbot-send"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: input.trim()
                      ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)'
                      : 'transparent',
                  }}
                >
                  {isLoading ? (
                    <Loader2 size={15} className="text-purple-300 animate-spin" />
                  ) : (
                    <Send size={15} className="text-white" />
                  )}
                </motion.button>
              </div>
              <p className="text-[9px] text-gray-600 text-center mt-2 font-mono tracking-wider">
                POWERED BY GEMINI AI • CODEARENA
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scoped styles for chat messages ─────────────────── */}
      <style>{`
        .chat-message-content code.chat-inline-code {
          background: rgba(168, 85, 247, 0.15);
          color: #c4b5fd;
          padding: 1px 6px;
          border-radius: 4px;
          font-family: 'Fira Code', monospace;
          font-size: 12px;
        }
        .chat-message-content pre.chat-code-block {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(168, 85, 247, 0.1);
          border-radius: 8px;
          padding: 10px 12px;
          margin: 8px 0;
          overflow-x: auto;
          font-size: 12px;
          line-height: 1.5;
        }
        .chat-message-content pre.chat-code-block code {
          font-family: 'Fira Code', monospace;
          color: #e2e8f0;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.2);
          border-radius: 9999px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.4);
        }
      `}</style>
    </>
  );
}
