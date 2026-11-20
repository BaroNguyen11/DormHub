// src/services/notification.service.js
import { api } from "../lib/api";

/**
 * Lấy danh sách thông báo của người dùng hiện tại
 * @param {Object} options
 * @param {boolean} [options.unreadOnly=false]
 * @param {number} [options.page=0]
 * @param {number} [options.size=20]
 * @param {string} [options.search=""]
 * @returns {Promise<any>}
 */
export async function getNotifications(options = {}) {
  // Hỗ trợ cả string ("all" | "unread") lẫn object options
  let unreadOnly = false;
  let page = 0;
  let size = 20;
  let search = "";

  if (typeof options === "string") {
    unreadOnly = options === "unread";
  } else if (typeof options === "object" && options !== null) {
    unreadOnly = Boolean(options.unreadOnly || options.filter === "unread");
    page = options.page ?? 0;
    size = options.size ?? 20;
    search = options.search ?? "";
  }

  const params = new URLSearchParams();
  if (unreadOnly) params.set("unreadOnly", "true");
  if (page) params.set("page", String(page));
  if (size) params.set("size", String(size));
  if (search) params.set("search", search);

  const query = params.toString() ? `?${params.toString()}` : "";
  return api(`/notifications${query}`, { method: "GET" });
}

/**
 * Đánh dấu 1 thông báo đã đọc
 * @param {number|string} id
 */
export async function markNotificationRead(id) {
  return api(`/notifications/${encodeURIComponent(id)}/read`, {
    method: "PATCH",
    successNotify: false,
  });
}

/**
 * Đánh dấu tất cả thông báo đã đọc
 */
export async function markAllNotificationsRead() {
  return api("/notifications/read-all", {
    method: "PATCH",
    successMessage: "Đã đánh dấu tất cả thông báo là đã đọc.",
  });
}

/**
 * Đếm số lượng thông báo chưa đọc
 */
export async function getUnreadNotificationCount() {
  const result = await api("/notifications/unread-count", {
    method: "GET",
    notify: false,
  });
  return Number(result?.unreadCount ?? result?.count ?? result ?? 0);
}

// Aliases cho tương thích ngược
export const markOneRead = markNotificationRead;
export const markAllRead = markAllNotificationsRead;

export const notificationService = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadNotificationCount,
  markOneRead,
  markAllRead,
};
