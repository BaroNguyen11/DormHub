// src/components/Chatbot.jsx
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, Bot, User, Loader } from 'lucide-react';
import { aiService } from '../services/ai.service';
import useAuth from '../hooks/useAuth';
import { marked } from 'marked';

export default function Chatbot({ isOpen, onClose }) {
  const { user, role } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Xin chào ${user?.fullName || 'bạn'}.

Tôi là trợ lý AI của DormHub. Tôi có thể giúp:
— Giải đáp thắc mắc về hệ thống
— Hướng dẫn sử dụng chức năng
— Tư vấn về hóa đơn, hợp đồng, phòng

Bạn cần hỗ trợ gì?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when open
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    const userMessage = input.trim();
    
    if (!userMessage || loading) return;

    setInput('');

    const newMessages = [
      ...messages,
      { role: 'user', content: userMessage }
    ];
    setMessages(newMessages);

    try {
      setLoading(true);

      const systemPrompt = aiService.createSystemPrompt(role, user);
      const apiMessages = aiService.formatMessages(
        newMessages.filter(m => m.role !== 'system'),
        systemPrompt
      );

      const response = await aiService.sendChatMessage(apiMessages);

      setMessages([
        ...newMessages,
        { role: 'assistant', content: response }
      ]);

    } catch (err) {
      console.error('Chatbot error:', err);
      
      setMessages([
        ...newMessages,
        { 
          role: 'assistant', 
          content: `Xin lỗi, tôi gặp lỗi: ${err.message}

Vui lòng thử lại hoặc liên hệ quản trị viên.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    if (confirm('Xóa toàn bộ lịch sử chat?')) {
      setMessages([
        {
          role: 'assistant',
          content: 'Đã xóa lịch sử chat. Bạn cần hỗ trợ gì?'
        }
      ]);
    }
  };

  // Parse markdown to HTML
  function parseMessage(content) {
    let html = marked.parse(content);
    html = html
      .replace(/<h1>/g, '<h1 class="text-base font-semibold mb-2 text-[oklch(0.2_0.02_260)]">')
      .replace(/<h2>/g, '<h2 class="text-[15px] font-semibold mb-2 mt-4 text-[oklch(0.2_0.02_260)]">')
      .replace(/<h3>/g, '<h3 class="text-[11px] font-medium uppercase tracking-wider mb-1.5 mt-3 text-[oklch(0.5_0.015_255)]">')
      .replace(/<p>/g, '<p class="mb-3 leading-relaxed">')
      .replace(/<ul>/g, '<ul class="my-3 pl-5 space-y-2">')
      .replace(/<ol>/g, '<ol class="my-3 pl-5 space-y-2 list-decimal">')
      .replace(/<li>/g, '<li class="leading-normal">')
      .replace(/<strong>/g, '<strong class="font-semibold text-[oklch(0.45_0.12_250)]">')
      .replace(/<code>/g, '<code class="px-1.5 py-0.5 rounded bg-[oklch(0.94_0.02_250)] text-[oklch(0.45_0.12_250)] text-[13px] font-mono">')
      .replace(/<pre>/g, '<pre class="bg-[oklch(0.96_0.008_92)] border border-[oklch(0.86_0.01_95)] rounded p-3 my-3 overflow-x-auto text-[13px] font-mono">');
    return html;
  }

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-24 right-6 z-[9999] w-[420px] max-w-[calc(100vw-48px)] h-[640px] max-h-[calc(100vh-120px)] 
                 bg-[oklch(1_0_0)] border border-[oklch(0.86_0.01_95)] rounded-md shadow-[0_1px_2px_oklch(0.2_0.02_260/0.04),0_12px_48px_oklch(0.2_0.02_260/0.12)]
                 flex flex-col overflow-hidden font-['IBM_Plex_Sans',system-ui,sans-serif]"
    >
      {/* Header */}
      <div className="bg-[oklch(0.96_0.008_92)] border-b border-[oklch(0.86_0.01_95)] px-6 py-5 grid grid-cols-[1fr_auto] gap-4 items-start">
        <div className="flex flex-col gap-1">
          <strong className="font-['Space_Grotesk',sans-serif] text-[15px] font-semibold tracking-tight text-[oklch(0.2_0.02_260)] leading-tight">
            Trợ lý AI
          </strong>
          <small className="text-[13px] text-[oklch(0.5_0.015_255)] tracking-wide leading-tight">
            DormHub Assistant
          </small>
        </div>
        <div className="flex gap-1.5 items-start">
          <button
            onClick={clearChat}
            className="bg-transparent border border-[oklch(0.86_0.01_95)] rounded h-8 w-8 flex items-center justify-center
                     text-[oklch(0.5_0.015_255)] transition-all duration-150
                     hover:text-[oklch(0.2_0.02_260)] hover:border-[oklch(0.5_0.015_255)] hover:bg-[oklch(0.98_0.006_90)]"
            title="Xóa lịch sử"
          >
            🗑️
          </button>
          <button
            onClick={onClose}
            className="bg-transparent border border-[oklch(0.86_0.01_95)] rounded h-8 w-8 flex items-center justify-center
                     text-[oklch(0.5_0.015_255)] transition-all duration-150
                     hover:text-[oklch(0.55_0.19_25)] hover:border-[oklch(0.55_0.19_25)]"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5 bg-[oklch(0.98_0.006_90)]
                    scrollbar-thin scrollbar-thumb-[oklch(0.86_0.01_95)] scrollbar-track-transparent
                    hover:scrollbar-thumb-[oklch(0.5_0.015_255)]">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`grid gap-3 ${msg.role === 'user' ? 'grid-cols-[1fr_auto] [direction:rtl]' : 'grid-cols-[auto_1fr]'}`}
          >
            {/* Icon badge */}
            <div className={`w-6 h-6 border rounded flex items-center justify-center flex-shrink-0 mt-0.5
                           ${msg.role === 'assistant' 
                             ? 'bg-[oklch(0.94_0.02_250)] border-[oklch(0.45_0.12_250)] text-[oklch(0.45_0.12_250)]' 
                             : 'bg-[oklch(0.92_0.01_90)] border-[oklch(0.82_0.015_90)] text-[oklch(0.5_0.015_255)]'
                           }`}
            >
              {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
            </div>

            {/* Content */}
            <div 
              className={`px-3.5 py-3 rounded text-sm text-[oklch(0.2_0.02_260)] max-w-full break-words [direction:ltr]
                         ${msg.role === 'assistant'
                           ? 'bg-[oklch(1_0_0)] border border-[oklch(0.86_0.01_95)]'
                           : 'bg-[oklch(0.92_0.01_90)] border border-[oklch(0.82_0.015_90)]'
                         }`}
              dangerouslySetInnerHTML={{ 
                __html: msg.role === 'assistant' 
                  ? parseMessage(msg.content) 
                  : msg.content.replace(/\n/g, '<br>')
              }}
            />
          </motion.div>
        ))}
        
        {/* Loading */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-[auto_1fr] gap-3"
          >
            <div className="w-6 h-6 border rounded flex items-center justify-center flex-shrink-0 mt-0.5
                          bg-[oklch(0.94_0.02_250)] border-[oklch(0.45_0.12_250)] text-[oklch(0.45_0.12_250)]">
              <Bot size={14} />
            </div>
            <div className="px-3.5 py-3 rounded text-sm bg-[oklch(1_0_0)] border border-[oklch(0.86_0.01_95)]
                          flex items-center gap-2 text-[oklch(0.5_0.015_255)]">
              <Loader size={16} className="animate-spin" />
              Đang suy nghĩ...
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-5 bg-[oklch(0.96_0.008_92)] border-t border-[oklch(0.86_0.01_95)] flex gap-2.5 items-end">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nhập câu hỏi của bạn..."
          disabled={loading}
          rows={1}
          className="flex-1 px-3 py-2.5 border border-[oklch(0.86_0.01_95)] rounded text-sm leading-normal
                   text-[oklch(0.2_0.02_260)] bg-[oklch(0.98_0.006_90)] resize-none max-h-30
                   placeholder:text-[oklch(0.5_0.015_255)]
                   transition-all duration-150
                   focus:outline-none focus:border-[oklch(0.45_0.12_250)] focus:shadow-[0_0_0_1px_oklch(0.45_0.12_250)]
                   disabled:bg-[oklch(0.96_0.008_92)] disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded border-0 bg-[oklch(0.45_0.12_250)] text-[oklch(0.99_0_0)]
                   flex items-center justify-center flex-shrink-0
                   transition-all duration-150
                   hover:bg-[oklch(0.38_0.12_250)]
                   active:translate-y-px
                   disabled:opacity-40 disabled:cursor-not-allowed
                   focus-visible:outline focus-visible:outline-2 focus-visible:outline-[oklch(0.45_0.12_250)] focus-visible:outline-offset-2"
        >
          <Send size={18} />
        </button>
      </div>
    </motion.div>
  );
}
