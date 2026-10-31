// ====================================
// CHAT SCREEN - Màn hình trò chuyện
// ====================================
// Chat giữa sinh viên và quản lý
// Mục đích: Giao tiếp real-time trong hệ thống

import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { asList } from "../../api/apiClient";
import { resources } from "../../services/resource.service";
import { errorMessage } from "../../utils/errorHandler";
import { Notice, Loading, Empty, Heading } from "./UIComponents";
import { useLoad } from "./useLoad";

/**
 * Component ChatScreen - Màn hình chat
 * @param {object} props
 * @param {object} props.config - Cấu hình màn hình
 * 
 * Config structure:
 * {
 *   resource: "/conversations",  // API endpoint danh sách conversations
 * }
 * 
 * Layout: 2 cột
 * - Trái: Danh sách conversations
 * - Phải: Chat window (messages + composer)
 */
export default function ChatScreen({ config }) {
  // Load danh sách conversations
  const { data, error, loading } = useLoad(config.resource, {});
  
  // State cho conversation đang được chọn
  const [selected, setSelected] = useState(null);
  
  // State cho danh sách messages của conversation đang chọn
  const [messages, setMessages] = useState([]);
  
  // State cho nội dung tin nhắn đang gõ
  const [text, setText] = useState("");
  
  // State cho loading của send button
  const [busy, setBusy] = useState(false);
  
  // State cho error khi send message
  const [sendError, setSendError] = useState("");
  
  // Convert data sang array
  const conversations = asList(data);
  
  /**
   * useEffect: Load messages khi chọn conversation
   * Chạy mỗi khi selected thay đổi
   */
  useEffect(() => {
    if (!selected) return;
    
    let isActive = true;
    
    // Fetch messages của conversation
    resources
      .list(`/conversations/${selected}/messages`)
      .then((result) => {
        if (isActive) setMessages(asList(result));
      })
      .catch((e) => {
        if (isActive) setSendError(errorMessage(e));
      });
    
    // Cleanup function
    return () => {
      isActive = false;
    };
  }, [selected]);
  
  /**
   * Handler khi gửi tin nhắn
   * @param {Event} e - Submit event
   */
  async function send(e) {
    e.preventDefault();
    
    // Kiểm tra: phải chọn conversation và nhập text
    if (!selected || !text.trim()) return;
    
    // Bắt đầu loading
    setBusy(true);
    setSendError("");
    
    try {
      // Gọi API tạo message mới
      await resources.create(`/conversations/${selected}/messages`, {
        content: text.trim(),
      });
      
      // Load lại messages
      const result = await resources.list(
        `/conversations/${selected}/messages`,
      );
      setMessages(asList(result));
      
      // Clear input
      setText("");
    } catch (e) {
      // Lỗi -> hiển thị error message
      setSendError(errorMessage(e));
    } finally {
      // Kết thúc loading
      setBusy(false);
    }
  }
  
  return (
    <>
      {/* Heading với breadcrumb */}
      <Heading config={config} />
      
      {/* Thông báo lỗi */}
      <Notice error={sendError || error} />
      
      {/* Chat Layout: 2 cột */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 h-[calc(100vh-200px)]">
        {/* Cột trái: Danh sách conversations */}
        <div className="bg-white border-2 border-[var(--color-line)] rounded-[var(--radius-lg)] overflow-y-auto flex flex-col">
          {loading ? (
            <Loading />
          ) : conversations.length ? (
            conversations.map((item) => (
              <button
                key={item.id}
                className={`text-left p-4 border-b border-[var(--color-line)] hover:bg-[var(--color-surface)] transition-colors ${selected === item.id ? "bg-[var(--color-surface)] border-l-4 border-l-[var(--color-primary)]" : ""}`}
                onClick={() => {
                  setSelected(item.id);
                  setSendError("");
                }}
              >
                {/* Hiển thị title hoặc tên người chat */}
                <div className="text-sm font-[family-name:var(--font-family-display)] font-semibold text-[var(--color-text)] truncate">
                  {item.title ||
                    item.participantName ||
                    `Cuộc trò chuyện #${item.id}`}
                </div>
              </button>
            ))
          ) : (
            <Empty text="Chưa có cuộc trò chuyện." />
          )}
        </div>
        
        {/* Cột phải: Chat window */}
        <div className="bg-white border-2 border-[var(--color-line)] rounded-[var(--radius-lg)] flex flex-col overflow-hidden">
          {selected ? (
            <>
              {/* Danh sách messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message, index) => (
                  <div className="flex flex-col gap-1" key={message.id || index}>
                    {/* Tên người gửi */}
                    <small className="text-xs font-[family-name:var(--font-family-display)] font-semibold text-[var(--color-text-muted)]">
                      {message.senderName ||
                        message.sender?.fullName ||
                        "Thành viên"}
                    </small>
                    
                    {/* Nội dung tin nhắn */}
                    <p className="bg-[var(--color-surface)] px-4 py-2 rounded-[var(--radius-md)] text-sm text-[var(--color-text)] max-w-[80%]">{message.content || message.text}</p>
                  </div>
                ))}
              </div>
              
              {/* Composer - Input gửi tin nhắn */}
              <form className="border-t-2 border-[var(--color-line)] p-4 flex gap-3" onSubmit={send}>
                <input
                  aria-label="Tin nhắn"
                  placeholder="Nhập tin nhắn…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 border-2 border-[var(--color-line)] rounded-[var(--radius-md)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                />
                
                {/* Nút gửi */}
                <button
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] font-[family-name:var(--font-family-display)] font-bold text-sm hover:bg-[var(--color-primary-hover)] hover:shadow-[var(--shadow-md)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={busy || !text.trim()}
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            // Chưa chọn conversation
            <Empty text="Chọn một cuộc trò chuyện để bắt đầu." />
          )}
        </div>
      </div>
    </>
  );
}
