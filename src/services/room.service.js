import { api, queryString } from '../api/apiClient';

export const roomService = {
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
