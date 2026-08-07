import api from 'common/services/api'
export const notificationService = {
  getAll:       async ()   => { const r = await api.get('/notifications');               return r.data.data; },
  markRead:     async (id) => { await api.put(`/notifications/${id}/read`); },
  getUnreadCount: async () => { const r = await api.get('/notifications/unread-count');  return r.data.data; },
};

