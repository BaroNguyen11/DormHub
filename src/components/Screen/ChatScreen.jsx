import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, User, RefreshCw, Bot, CheckCircle2 } from "lucide-react";
import { asList } from "../../api/apiClient";
import { resources } from "../../services/resource.service";
import { errorMessage } from "../../utils/errorHandler";
import { Notice, Loading, Empty, Heading } from "./UIComponents";
import { useLoad } from "./useLoad";
import useAuth from "../../hooks/useAuth";

export default function ChatScreen({ config }) {
  const { user } = useAuth();

  // Load danh sách cuộc trò chuyện
  const { data, error, loading } = useLoad(config.resource, {});

  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState("");

  const conversations = asList(data);
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống cuối khung chat khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch tin nhắn khi chọn conversation
  useEffect(() => {
    if (!selected) return;

    let isActive = true;

    resources
      .list(`/conversations/${selected}/messages`)
      .then((result) => {
        if (isActive) setMessages(asList(result));
      })
      .catch((e) => {
        if (isActive) setSendError(errorMessage(e));
      });

    return () => {
      isActive = false;
    };
  }, [selected]);

  // Gửi tin nhắn
  async function send(e) {
    e.preventDefault();
    if (!selected || !text.trim()) return;

    setBusy(true);
    setSendError("");

    try {
      await resources.create(`/conversations/${selected}/messages`, {
        content: text.trim(),
      });

      const result = await resources.list(
        `/conversations/${selected}/messages`,
      );
      setMessages(asList(result));
      setText("");
    } catch (e) {
      setSendError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  // Tìm thông tin conversation đang được chọn
  const activeConversation = conversations.find((c) => c.id === selected);

  return (
    <div className="space-y-6">
      {/* Notice hiển thị lỗi nếu có */}
      <Notice error={sendError || error} />

      {/* Khung Chat Layout 2 Cột Neo-Brutalism */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-220px)] min-h-137.5">
        {/* CỘT TRÁI: Danh sách Cuộc trò chuyện (4 cột) */}
        <div className="lg:col-span-4 bg-surface border-4 border-line-strong rounded-2xl overflow-hidden shadow-[6px_6px_0_#141413] flex flex-col h-full">
          {/* Header danh sách */}
          <div className="p-4 bg-surface-2 border-b-4 border-line-strong flex items-center gap-2">
            <div className="size-8 rounded-lg  border-2 border-line-strong flex items-center justify-center shadow-[1.5px_1.5px_0_#141413]">
              <MessageSquare
                size={18}
                className="text-text"
                strokeWidth={2.5}
              />
            </div>
            <h2 className="text-sm font-black text-text uppercase tracking-wider">
              Hộp thư hỗ trợ
            </h2>
          </div>

          {/* Body danh sách cuộc trò chuyện */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {loading ? (
              <Loading />
            ) : conversations.length ? (
              conversations.map((item) => {
                const isSelected = selected === item.id;
                const title =
                  item.title ||
                  item.participantName ||
                  `Cuộc trò chuyện #${item.id}`;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelected(item.id);
                      setSendError("");
                    }}
                    className={`w-full text-left p-3 rounded-sm border-3 border-line-strong transition-all flex items-center gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-primary text-text font-black shadow-[4px_4px_0_#141413] translate-x-1"
                        : "bg-surface hover:bg-surface-2 text-text font-bold shadow-[2px_2px_0_#141413] hover:translate-x-0.5"
                    }`}
                  >
                    <div
                      className={`size-10 rounded-xl border-2 border-line-strong flex items-center justify-center shrink-0 shadow-[2px_2px_0_#141413] ${
                        isSelected ? "bg-surface" : "bg-warning"
                      }`}
                    >
                      <User
                        size={18}
                        className="text-text"
                        strokeWidth={2.5}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-black text-[#000000] truncate">{title}</span>
                        {isSelected && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-surface-3 text-text rounded-md shrink-0">
                            Đang chọn
                          </span>
                        )}
                      </div>
                      <p className={`text-xs truncate mt-0.5 font-semibold ${isSelected ? "text-[#000000]" : "text-text-muted"}`}>
                        {item.lastMessage || "Nhấn để xem tin nhắn..."}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <Empty text="Chưa có cuộc trò chuyện nào." />
            )}
          </div>
        </div>

        {/* CỘT PHẢI: Khung Cửa sổ Chat (8 cột) */}
        <div className="lg:col-span-8 bg-surface border-4 border-line-strong rounded-2xl overflow-hidden shadow-[6px_6px_0_#141413] flex flex-col h-full">
          {selected ? (
            <>
              {/* Header Cửa sổ Chat đang chọn */}
              <div className="p-4 bg-surface-2 border-b-4 border-line-strong flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-primary border-2 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413]">
                    <User size={18} className="text-text" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-text">
                      {activeConversation?.title ||
                        activeConversation?.participantName ||
                        `Cuộc trò chuyện #${selected}`}
                    </h3>
                    <span className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1">
                      <span className="size-2 rounded-full bg-success inline-block animate-pulse"></span>
                      Trực tuyến
                    </span>
                  </div>
                </div>
              </div>

              {/* Danh sách Bong bóng tin nhắn */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-surface/40">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-text-muted font-bold text-sm">
                    Hãy gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện.
                  </div>
                ) : (
                  messages.map((message, index) => {
                    // Kiểm tra linh hoạt kiểu dữ liệu (String/Number/Object) để xác định xem có phải chính mình gửi không
                    const isSelf =
                      Boolean(message.isSelf) ||
                      (user?.id != null && (
                        String(message.senderId) === String(user.id) ||
                        String(message.sender_id) === String(user.id) ||
                        String(message.sender?.id) === String(user.id) ||
                        String(message.userId) === String(user.id)
                      )) ||
                      (user?.fullName && (
                        message.senderName === user.fullName ||
                        message.sender?.fullName === user.fullName
                      ));

                    const senderName = isSelf
                      ? "Bạn"
                      : message.senderName ||
                        message.sender?.fullName ||
                        "Thành viên";

                    return (
                      <div
                        key={message.id || index}
                        className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[70%] ${
                          isSelf ? "ml-auto items-end" : "mr-auto items-start"
                        }`}
                      >
                        {/* Tên người gửi */}
                        <span className="text-[11px] font-extrabold text-text-muted px-1">
                          {senderName}
                        </span>

                        {/* Bong bóng nội dung tin nhắn */}
                        <div
                          className={`px-4 py-3 rounded-2xl border-3 border-line-strong text-sm! font-bold shadow-[3px_3px_0_#141413] wrap-break-word ${
                            isSelf
                              ? "bg-primary text-text rounded-tr-xs"
                              : "bg-surface text-text rounded-tl-xs"
                          }`}
                        >
                          {message.content || message.text}
                        </div>
                      </div>
                    );
                  })
                )}
                {/* Anchor cuộn xuống cuối */}
                <div ref={messagesEndRef} />
              </div>

              {/* Form Khung nhập Tin nhắn (Composer) */}
              <form
                onSubmit={send}
                className="p-4 bg-surface border-t-4 border-line-strong flex gap-3 items-center"
              >
                <input
                  aria-label="Tin nhắn"
                  placeholder="Nhập nội dung tin nhắn..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 border-3 border-line-strong rounded-xl px-4 py-3 text-sm font-bold text-text bg-surface shadow-[2px_2px_0_#141413] focus:shadow-[4px_4px_0_#141413] outline-none! transition-all placeholder:font-medium placeholder:text-text-muted/60"
                />

                <button
                  type="submit"
                  disabled={busy || !text.trim()}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-text font-extrabold text-sm rounded-xl border-3 border-line-strong shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none cursor-pointer shrink-0"
                >
                  {busy ? (
                    <RefreshCw
                      size={18}
                      strokeWidth={2.5}
                      className="animate-spin"
                    />
                  ) : (
                    <Send size={18} strokeWidth={2.5} />
                  )}
                  <span className="hidden sm:inline">Gửi</span>
                </button>
              </form>
            </>
          ) : (
            // Trạng thái chưa chọn cuộc trò chuyện
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-surface/30">
              <div className="size-16 rounded-2xl bg-warning border-4 border-line-strong flex items-center justify-center shadow-[4px_4px_0_#141413] mb-4">
                <Bot size={32} className="text-text" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-black text-text mb-1">
                Chưa chọn cuộc trò chuyện
              </h3>
              <p className="text-xs font-semibold text-text-muted">
                Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu trao
                đổi thông tin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}