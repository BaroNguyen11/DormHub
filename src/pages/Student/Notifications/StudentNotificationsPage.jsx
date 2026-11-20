// src/pages/Student/Notifications/StudentNotificationsPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Receipt,
  Building2,
  Wrench,
  Info,
  Clock,
  ArrowRight,
  Inbox,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import Workspace from "../../../components/Workspace";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../../services/notification.service";
import { toast } from "sonner";

/**
 * Phân tích và sinh link điều hướng thông minh theo loại & nội dung thông báo
 */
function getSmartAction(item) {
  if (!item) return null;
  const type = String(item.type || "").toUpperCase();
  const text =
    `${type} ${item.title || ""} ${item.body || item.message || ""}`.toLowerCase();

  if (
    type.includes("INVOICE") ||
    type.includes("PAYMENT") ||
    text.includes("hóa đơn") ||
    text.includes("thanh toán") ||
    text.includes("tiền phòng") ||
    text.includes("tiền điện") ||
    text.includes("tiền nước")
  ) {
    return {
      label: "Đi tới Hóa đơn",
      url: "/student/invoices",
      Icon: Receipt,
    };
  }

  if (
    type.includes("CONTRACT") ||
    type.includes("ROOM") ||
    type.includes("APPLICATION") ||
    type.includes("CHECKIN") ||
    type.includes("CHECKOUT") ||
    type.includes("RENEWAL") ||
    type.includes("TRANSFER") ||
    text.includes("hợp đồng") ||
    text.includes("đăng ký phòng") ||
    text.includes("chuyển phòng") ||
    text.includes("gia hạn")
  ) {
    return {
      label: "Đi tới Hợp đồng & Chỗ ở",
      url: "/student/room-contract",
      Icon: Building2,
    };
  }

  if (
    type.includes("MAINTENANCE") ||
    text.includes("bảo trì") ||
    text.includes("sửa chữa") ||
    text.includes("báo hỏng")
  ) {
    return {
      label: "Đi tới Yêu cầu Báo hỏng",
      url: "/student/maintenance",
      Icon: Wrench,
    };
  }

  return null;
}

/**
 * Hiển thị Icon phù hợp theo loại thông báo
 */
function NotificationIcon({ item, className = "size-4" }) {
  const type = String(item?.type || "").toUpperCase();
  const text = `${type} ${item?.title || ""}`.toLowerCase();

  if (
    type.includes("INVOICE") ||
    text.includes("hóa đơn") ||
    text.includes("thanh toán")
  ) {
    return <Receipt className={className} />;
  }
  if (
    type.includes("CONTRACT") ||
    text.includes("hợp đồng") ||
    text.includes("phòng")
  ) {
    return <Building2 className={className} />;
  }
  if (
    type.includes("MAINTENANCE") ||
    text.includes("bảo trì") ||
    text.includes("sửa chữa")
  ) {
    return <Wrench className={className} />;
  }
  return <Bell className={className} />;
}

export default function StudentNotificationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "unread"
  const [selectedNotification, setSelectedNotification] = useState(null);

  const queryId = searchParams.get("id");

  // Load danh sách thông báo từ API
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getNotifications({
        unreadOnly: activeTab === "unread",
        size: 50,
      });

      const list = Array.isArray(response)
        ? response
        : response?.content || response?.items || [];

      setNotifications(list);

      // Nếu có query param ?id=, tự động tìm và chọn
      if (queryId) {
        const found = list.find(
          (n) => String(n.id ?? n.notificationId) === String(queryId),
        );
        if (found) {
          setSelectedNotification(found);
          if (!found.isRead) {
            handleMarkRead(found);
          }
          return;
        }
      }

      // Nếu chưa có item nào được chọn và danh sách có phần tử
      setSelectedNotification((current) => {
        if (current) {
          const stillThere = list.find(
            (n) =>
              String(n.id ?? n.notificationId) ===
              String(current.id ?? current.notificationId),
          );
          if (stillThere) return stillThere;
        }
        return list.length > 0 ? list[0] : null;
      });
    } catch (error) {
      console.error("Lỗi khi tải thông báo:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, queryId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Đánh dấu 1 thông báo là đã đọc
  const handleMarkRead = async (item) => {
    const id = item.id ?? item.notificationId;
    if (!id || item.isRead) return;

    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          String(n.id ?? n.notificationId) === String(id)
            ? { ...n, isRead: true }
            : n,
        ),
      );
      setSelectedNotification((prev) =>
        prev && String(prev.id ?? prev.notificationId) === String(id)
          ? { ...prev, isRead: true }
          : prev,
      );
    } catch {
      // Ignored: apiClient handles errors
    }
  };

  // Chọn một thông báo để xem chi tiết
  const handleSelect = (item) => {
    setSelectedNotification(item);
    const id = item.id ?? item.notificationId;
    setSearchParams({ id: String(id) });
    if (!item.isRead) {
      handleMarkRead(item);
    }
  };

  // Đánh dấu tất cả đã đọc
  const handleMarkAllRead = async () => {
    if (markingAll) return;
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setSelectedNotification((prev) =>
        prev ? { ...prev, isRead: true } : null,
      );
    } catch {
      // Ignored
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const smartAction = useMemo(() => {
    return getSmartAction(selectedNotification);
  }, [selectedNotification]);

  return (
    <Workspace group="student" title="Thông báo">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface border-2 border-black rounded-sm p-4 sm:p-5 shadow-[4px_4px_0_#141413]">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-text flex items-center gap-2.5">
              <span className="p-2 bg-primary/20 border-2 border-black rounded-sm shadow-[2px_2px_0_#141413]">
                <Bell className="size-5 sm:size-6 text-black" />
              </span>
              Hộp thư Thông báo
            </h1>
            <p className="text-xs sm:text-sm text-text-muted font-bold mt-1">
              Xem các thông báo mới nhất từ Ban Quản lý ký túc xá và cập nhật
              phòng ở của bạn.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll || unreadCount === 0}
              className="px-3.5 py-2 bg-surface text-text border-2 border-black rounded-sm text-xs! sm:text-sm font-extrabold! shadow-[2px_2px_0_#141413] hover:shadow-[3px_3px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-2"
            >
              <CheckCheck className="size-4" />
              Đánh dấu tất cả đã đọc
            </button>
            <button
              onClick={fetchNotifications}
              disabled={loading}
              className="p-2 bg-surface text-text border-2 border-black rounded-sm shadow-[2px_2px_0_#141413] hover:shadow-[3px_3px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none transition-all"
              title="Làm mới"
              aria-label="Làm mới"
            >
              <RefreshCw
                className={`size-4.5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* 2-Column Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* CỘT TRÁI: Danh sách thông báo */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 bg-surface border-2 border-black rounded-sm p-1.5 shadow-[3px_3px_0_#141413]">
              <button
                onClick={() => setActiveTab("all")}
                className={`flex-1 py-1.5 px-3 rounded-sm text-xs! font-black! transition-all flex items-center justify-center gap-2 ${
                  activeTab === "all"
                    ? "bg-primary text-black border-2 border-black shadow-[2px_2px_0_#141413]"
                    : "text-text-muted hover:text-text hover:bg-surface-2 border-2 border-transparent"
                }`}
              >
                Tất cả ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab("unread")}
                className={`flex-1 py-1.5 px-3 rounded-sm text-xs! font-black! transition-all flex items-center justify-center gap-2 ${
                  activeTab === "unread"
                    ? "bg-primary text-black border-2 border-black shadow-[2px_2px_0_#141413]"
                    : "text-text-muted hover:text-text hover:bg-surface-2 border-2 border-transparent"
                }`}
              >
                Chưa đọc
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-error text-white text-[10px] font-black border border-black">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Notification Cards List */}
            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-18rem)] pr-1">
              {loading && notifications.length === 0 ? (
                <div className="bg-surface border-2 border-black rounded-sm p-8 text-center shadow-[3px_3px_0_#141413]">
                  <RefreshCw className="size-6 animate-spin mx-auto text-text-muted mb-2" />
                  <p className="text-xs font-bold text-text-muted">
                    Đang tải danh sách thông báo...
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="bg-surface border-2 border-black rounded-sm p-8 text-center shadow-[3px_3px_0_#141413]">
                  <Inbox className="size-10 mx-auto text-text-muted mb-3 opacity-40" />
                  <p className="text-sm font-extrabold text-text">
                    Không có thông báo nào
                  </p>
                  <p className="text-xs text-text-muted font-bold mt-1">
                    {activeTab === "unread"
                      ? "Bạn đã đọc hết tất cả thông báo."
                      : "Hiện chưa có thông báo nào từ ký túc xá."}
                  </p>
                </div>
              ) : (
                notifications.map((item) => {
                  const itemId = item.id ?? item.notificationId;
                  const isSelected =
                    selectedNotification &&
                    String(
                      selectedNotification.id ??
                        selectedNotification.notificationId,
                    ) === String(itemId);

                  return (
                    <div
                      key={itemId}
                      onClick={() => handleSelect(item)}
                      className={`p-4 rounded-sm border-2 border-black cursor-pointer transition-all ${
                        isSelected
                          ? "bg-primary-light border-line-strong shadow-[4px_4px_0_#141413] translate-x-1"
                          : item.isRead
                            ? "bg-surface text-text-muted hover:bg-surface-2 border-black shadow-[2px_2px_0_#141413] hover:shadow-[3px_3px_0_#141413]"
                            : "bg-surface text-text border-black shadow-[3px_3px_0_#141413] hover:shadow-[4px_4px_0_#141413]"
                      }`}
                    >
                      <div className="flex items-start gap-2.5 justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`p-1.5 rounded-sm border border-black shrink-0 ${
                              item.isRead
                                ? "bg-surface-2 text-text-muted"
                                : "bg-warning text-black"
                            }`}
                          >
                            <NotificationIcon
                              item={item}
                              className="size-3.5"
                            />
                          </span>
                          <h3
                            className={`text-sm truncate font-extrabold ${
                              item.isRead ? "text-text-muted" : "text-text"
                            }`}
                          >
                            {item.title || "Thông báo KTX"}
                          </h3>
                        </div>

                        {!item.isRead && (
                          <span
                            className="size-2.5 rounded-full bg-primary border border-black shrink-0 mt-1 shadow-[1px_1px_0_#141413]"
                            title="Chưa đọc"
                            aria-label="Chưa đọc"
                          />
                        )}
                      </div>

                      <p className="text-xs text-text-muted font-semibold mt-2 line-clamp-2 leading-relaxed">
                        {item.body ||
                          item.message ||
                          "Không có nội dung tóm tắt."}
                      </p>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-line-strong/30 text-[11px] text-text-muted font-bold">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString("vi-VN")
                            : "—"}
                        </span>
                        {item.isRead ? (
                          <span className="text-[10px] uppercase font-extrabold text-text-muted/70">
                            Đã đọc
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-extrabold text-primary">
                            Mới
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* CỘT PHẢI: Chi tiết thông báo đang chọn */}
          <div className="lg:col-span-7">
            {selectedNotification ? (
              <div className="bg-surface border-2 border-black rounded-sm p-6 sm:p-8 shadow-[5px_5px_0_#141413] flex flex-col min-h-[420px]">
                {/* Meta Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-black">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-warning text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0_#141413]">
                      <NotificationIcon
                        item={selectedNotification}
                        className="size-3.5"
                      />
                      {selectedNotification.type || "THÔNG BÁO"}
                    </span>
                    {selectedNotification.isRead ? (
                      <span className="px-2 py-0.5 rounded-sm bg-surface-2 text-text-muted border border-black text-[11px] font-bold">
                        Đã đọc
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-sm bg-primary-light text-black border border-black text-[11px] font-black">
                        Chưa đọc
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-bold text-text-muted flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    {selectedNotification.createdAt
                      ? new Date(selectedNotification.createdAt).toLocaleString(
                          "vi-VN",
                        )
                      : "—"}
                  </span>
                </div>

                {/* Tiêu đề */}
                <h2 className="text-xl sm:text-2xl font-black text-text mt-5 mb-4 leading-snug">
                  {selectedNotification.title || "Thông báo ký túc xá"}
                </h2>

                {/* Nội dung đầy đủ */}
                <div className="bg-surface-2 border-2 border-black rounded-sm p-4 sm:p-6 mb-6 shadow-[2px_2px_0_#141413]">
                  <p className="whitespace-pre-wrap text-sm sm:text-base font-semibold leading-relaxed text-text">
                    {selectedNotification.body ||
                      selectedNotification.message ||
                      "Nội dung thông báo không có sẵn."}
                  </p>
                </div>

                {/* Nút hành động thông minh (Smart Action) */}
                {smartAction && (
                  <div className="mt-auto pt-4 border-t-2 border-black flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-primary-light/50 border-2 rounded-sm p-4 shadow-[3px_3px_0_#141413]">
                    <div>
                      <strong className="block text-sm! font-black! text-text">
                        Hành động liên quan
                      </strong>
                      <span className="text-xs! font-bold! text-text-muted">
                        Bạn có thể chuyển tới trang chức năng tương ứng để xử lý.
                      </span>
                    </div>

                    <button
                      onClick={() => navigate(smartAction.url)}
                      className="px-4 py-2.5 bg-primary text-black border-2 border-black! rounded-sm text-sm! font-black! shadow-[3px_3px_0_#141413] hover:shadow-[4px_4px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <smartAction.Icon className="size-4" />
                      <span>{smartAction.label}</span>
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-surface border-2 border-black rounded-sm p-12 text-center shadow-[4px_4px_0_#141413] flex flex-col items-center justify-center min-h-105">
                <div className="size-16 rounded-full bg-surface-2 border-2 border-black grid place-items-center shadow-[3px_3px_0_#141413] mb-4">
                  <Inbox className="size-8 text-text-muted opacity-60" />
                </div>
                <h3 className="text-base font-extrabold text-text">
                  Chưa chọn thông báo nào
                </h3>
                <p className="text-xs text-text-muted font-bold mt-1 ">
                  Vui lòng bấm chọn một thông báo từ danh sách bên trái để đọc
                  nội dung chi tiết.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Workspace>
  );
}
