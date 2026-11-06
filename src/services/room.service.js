import { api, ApiError, queryString } from '../api/apiClient';
import { isDemoSession } from './demo.service';

function requireBackendSession() {
  if (isDemoSession()) {
    throw new ApiError('Tìm kiếm AI cần tài khoản sinh viên đăng nhập trên backend. Hãy đăng xuất tài khoản xem thử và đăng nhập lại.', 401);
  }
}

export const roomService = {
  getStudentRooms: (signal) => {
    requireBackendSession();
    return api('/student/rooms', { signal });
  },
  semanticSearch: (request, signal) => {
    requireBackendSession();
    return api('/student/rooms/semantic-search', {
      method: 'POST',
      body: request,
      signal,
    });
  },
  semanticSearchAnalysis: (request, signal) => {
    requireBackendSession();
    return api('/student/rooms/semantic-search/analysis', {
      method: 'POST',
      body: request,
      signal,
    });
  },
  getSearchBuildings: () => {
    requireBackendSession();
    return api('/student/rooms/buildings');
  },
  // Get all rooms with filters
  getAll: (params = {}) => api(`/manager/rooms${queryString(params)}`),
  
  // Get available rooms
  getAvailable: () => api('/manager/rooms/available'),
  
  // Get room by ID
  getById: (id) => api(`/manager/rooms/${id}`),
  
  // Create new room
  create: (data) => api('/manager/rooms', {
    method: 'POST',
    body: data,
  }),
  
  // Update room
  update: (id, data) => api(`/manager/rooms/${id}`, {
    method: 'PUT',
    body: data,
  }),
  
  // Update room status
  updateStatus: (id, status) => api(`/manager/rooms/${id}/status?status=${status}`, {
    method: 'PATCH',
  }),
  
  // Delete room
  delete: (id) => api(`/manager/rooms/${id}`, {
    method: 'DELETE',
  }),
};
