import { api } from '../api/apiClient';

export const notificationService = {
  // Get my notifications
  getMyNotifications: (unreadOnly = false, page = 0, size = 10) => 
    api(`/notifications?unreadOnly=${unreadOnly}&page=${page}&size=${size}`),
  
  // Get unread count
  getUnreadCount: () => api('/notifications/unread-count'),
  
  // Mark as read
  markAsRead: (id) => api(`/notifications/${id}/read`, {
    method: 'PATCH',
  }),
  
  // Mark all as read
  markAllAsRead: () => api('/notifications/read-all', {
    method: 'PATCH',
  }),
};
