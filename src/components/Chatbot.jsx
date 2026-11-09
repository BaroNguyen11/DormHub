// src/components/Chatbot.jsx
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, X, Bot, User, RefreshCw, Trash2 } from "lucide-react";
import { aiService } from "../services/ai.service";
import useAuth from "../hooks/useAuth";
import { marked } from "marked";

export default function Chatbot({ isOpen, onClose }) {
  const { user, role } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Xin chào **${user?.fullName || "bạn"}**! 👋

Tôi là trợ lý AI của **DormHub**. Tôi có thể hỗ trợ bạn:
- 💡 Giải đáp thắc mắc về quy định nội trú
- 📝 Hướng dẫn đăng ký phòng, gửi yêu cầu sửa chữa
- 🧾 Tra cứu thông tin hợp đồng & hóa đơn

Bạn cần hỗ trợ gì hôm nay?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputChange = (e) => {
    const el = e.currentTarget;

    setInput(el.value);

    const minHeight = 44;
    const maxHeight = 120;

    el.style.height = "auto";

    const styles = window.getComputedStyle(el);
    const borderHeight =
      parseFloat(styles.borderTopWidth) + parseFloat(styles.borderBottomWidth);

    const contentHeight = el.scrollHeight + borderHeight;
    const nextHeight = Math.min(Math.max(contentHeight, minHeight), maxHeight);

    el.style.height = `${nextHeight}px`;
    el.style.overflowY = contentHeight > maxHeight ? "auto" : "hidden";

    setIsExpanded(nextHeight > minHeight);
  };
  // Auto scroll khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input khi mở chatbot
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    const userMessage = input.trim();
    if (!userMessage || loading) return;

    setInput("");

    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);

    try {
      setLoading(true);

      const systemPrompt = aiService.createSystemPrompt(role, user);
      const apiMessages = aiService.formatMessages(
        newMessages.filter((m) => m.role !== "system"),
        systemPrompt,
      );

      const response = await aiService.sendChatMessage(apiMessages);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
    } catch (err) {
      console.error("Chatbot error:", err);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ **Có lỗi xảy ra:** ${err.message}\n\nVui lòng thử lại hoặc liên hệ ban quản lý.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    if (window.confirm("Xóa toàn bộ lịch sử trò chuyện này?")) {
      setMessages([
        {
          role: "assistant",
          content: "Đã xóa lịch sử chat. Bạn cần hỗ trợ thông tin gì mới?",
        },
      ]);
    }
  };

  // Parse markdown sang HTML chuẩn Neo-Brutalism
  function parseMessage(content) {
    let html = marked.parse(content);
    html = html
      .replace(/<h1>/g, '<h1 class="text-base font-black mb-2 text-text">')
      .replace(/<h2>/g, '<h2 class="text-sm font-black mb-2 mt-3 text-text">')
      .replace(
        /<h3>/g,
        '<h3 class="text-xs font-black uppercase tracking-wider mb-1.5 mt-2 text-text-muted">',
      )
      .replace(/<p>/g, '<p class="mb-2 leading-relaxed font-semibold">')
      .replace(/<ul>/g, '<ul class="my-2 pl-4 space-y-1 list-disc">')
      .replace(
        /<ol>/g,
        '<ol class="my-2 pl-4 space-y-1 list-decimal font-bold">',
      )
      .replace(/<li>/g, '<li class="leading-relaxed font-semibold">')
      .replace(/<strong>/g, '<strong class="font-black text-text">')
      .replace(
        /<code>/g,
        '<code class="px-1.5 py-0.5 rounded bg-warning/30 text-text text-xs font-mono border border-line-strong">',
      )
      .replace(
        /<pre>/g,
        '<pre class="bg-surface-2 border-2 border-line-strong rounded-sm p-3 my-2 overflow-x-auto text-xs font-mono shadow-[2px_2px_0_#141413]">',
      );
    return html;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-9999 w-105 max-w-[calc(100vw-32px)] h-155 max-h-[calc(100vh-100px)] bg-surface border-4 border-line-strong rounded-sm shadow-[8px_8px_0_#141413] flex flex-col overflow-hidden text-text"
        >
          {/* HEADER CHATBOT */}
          <div className="bg-primary border-b-4 border-line-strong px-5 py-4 flex items-center justify-between shadow-[0_2px_0_#141413] shrink-0">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-sm bg-warning border-2 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413]">
                <Bot size={22} className="text-text" strokeWidth={2.5} />
              </div>
              <div>
                <strong className="block text-base font-black text-text tracking-tight leading-none">
                  Trợ lý DormHub AI
                </strong>
                <span className="text-[11px] font-extrabold text-text/70 uppercase tracking-wider block mt-1">
                  Trực tuyến 24/7
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearChat}
                className="size-8 rounded-sm bg-surface border-2 border-line-strong flex items-center justify-center text-text shadow-[2px_2px_0_#141413] hover:bg-warning hover:-translate-px active:translate-px active:shadow-none transition-all cursor-pointer"
                title="Xóa lịch sử chat"
              >
                <Trash2 size={16} strokeWidth={2.5} />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="size-8 rounded-sm bg-error text-white border-2 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413]  hover:-translate-px active:translate-px active:shadow-none transition-all cursor-pointer"
                title="Đóng cửa sổ"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* DANH SÁCH TIN NHẮN */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4 bg-surface/50">
            {messages.map((msg, idx) => {
              const isAssistant = msg.role === "assistant";

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`flex gap-2.5 max-w-[88%] ${
                    isAssistant
                      ? "mr-auto flex-row"
                      : "ml-auto flex-row-reverse"
                  }`}
                >
                  {/* Badge Avatar */}
                  <div
                    className={`size-8 rounded-sm border-2 border-line-strong flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0_#141413] mt-0.5 ${
                      isAssistant ? "bg-warning" : "bg-primary"
                    }`}
                  >
                     {isAssistant ? (
                      <Bot size={18} className="text-text" strokeWidth={2.5} />
                    ) : (
                      <User
                        size={18}
                        className="text-text"
                        strokeWidth={2.5}
                      />
                    )}
                  </div>

                  {/* Bong bóng tin nhắn Neo-Brutalism */}
                   <div
                    className={`p-3.5 rounded-sm border-3 border-line-strong text-xs sm:text-sm font-bold shadow-[3px_3px_0_#141413] wrap-break-word ${
                      isAssistant
                        ? "bg-surface text-text rounded-tl-xs"
                        : "bg-primary text-text rounded-tr-xs"
                    }`}
                  >
                    {isAssistant ? (
                      <div
                        className="space-y-1"
                        dangerouslySetInnerHTML={{
                          __html: parseMessage(msg.content),
                        }}
                      />
                    ) : (
                      <p className="whitespace-pre-wrap font-bold m-0">
                        {msg.content}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* Trạng thái AI đang phản hồi */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2.5 mr-auto max-w-[85%]"
              >
                <div className="size-8 rounded-sm bg-warning border-2 border-line-strong flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0_#141413]">
                  <Bot size={18} className="text-text" strokeWidth={2.5} />
                </div>
                <div className="px-4 py-3 rounded-sm rounded-tl-xs bg-surface border-3 border-line-strong shadow-[3px_3px_0_#141413] flex items-center gap-2 text-xs font-extrabold text-text">
                  <RefreshCw
                    size={16}
                    strokeWidth={2.5}
                    className="animate-spin text-primary"
                  />
                  <span>DormHub AI đang suy nghĩ...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Ô NHẬP TIN NHẮN */}
          <div className="p-3.5 bg-surface border-t-4 border-line-strong flex gap-2.5 items-end shrink-0">
            {/* <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Hỏi AI về hợp đồng, hóa đơn, quy định..."
              disabled={loading}
              rows={1}
              className="flex-1 border-3 border-line-strong rounded-sm px-3.5 py-2.5 text-xs! sm:text-sm     font-bold text-text bg-surface shadow-[2px_2px_0_#141413] focus:shadow-[4px_4px_0_#141413]  outline-none!  resize-none max-h-28 placeholder:font-semibold placeholder:text-text-muted/60 disabled:opacity-50 transition-all"
            /> */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Hỏi AI về hợp đồng, hóa đơn, quy định..."
              disabled={loading}
              rows={1}
              className={`
    chat-textarea
    flex-1 min-w-0
      min-h-11 max-h-30
    border-3 border-line-strong
    ${isExpanded ? "rounded-md" : "rounded-sm"}
    px-3.5   leading-10
    text-xs! sm:text-sm
    font-bold text-text bg-surface
    shadow-[2px_2px_0_#141413]
    focus:shadow-[4px_4px_0_#141413]
    focus:border-primary
    outline-none! resize-none
    placeholder:font-semibold
    placeholder:text-text-muted/60
    disabled:opacity-50
    transition-all duration-200
  `}
              style={{ overflowY: "hidden" }}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="size-10 rounded-sm bg-primary text-text border-3 border-line-strong flex items-center justify-center shrink-0 shadow-[2px_2px_0_#141413] hover:shadow-[4px_4px_0_#141413] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all cursor-pointer"
            >
              <Send size={18} strokeWidth={2.5} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
