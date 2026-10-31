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
      <div className="chat-layout">
        {/* Cột trái: Danh sách conversations */}
        <div className="panel chat-list">
          {loading ? (
            <Loading />
          ) : conversations.length ? (
            conversations.map((item) => (
              <button
                key={item.id}
                className={selected === item.id ? "selected" : ""}
                onClick={() => {
                  setSelected(item.id);
                  setSendError("");
                }}
              >
                {/* Hiển thị title hoặc tên người chat */}
                {item.title ||
                  item.participantName ||
                  `Cuộc trò chuyện #${item.id}`}
              </button>
            ))
          ) : (
            <Empty text="Chưa có cuộc trò chuyện." />
          )}
        </div>
        
        {/* Cột phải: Chat window */}
        <div className="panel chat-window">
          {selected ? (
            <>
              {/* Danh sách messages */}
              <div className="messages">
                {messages.map((message, index) => (
                  <div className="message" key={message.id || index}>
                    {/* Tên người gửi */}
                    <small>
                      {message.senderName ||
                        message.sender?.fullName ||
                        "Thành viên"}
                    </small>
                    
                    {/* Nội dung tin nhắn */}
                    <p>{message.content || message.text}</p>
                  </div>
                ))}
              </div>
              
              {/* Composer - Input gửi tin nhắn */}
              <form className="chat-composer" onSubmit={send}>
                <input
                  aria-label="Tin nhắn"
                  placeholder="Nhập tin nhắn…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                
                {/* Nút gửi */}
                <button
                  className="button primary"
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
