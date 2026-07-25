import api from '@/lib/api';

const userService = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: unknown) => api.put('/user/profile', data),
  getNotifications: (limit = 30) => api.get('/user/notifications', { params: { limit } }),
  getUnreadNotificationsCount: () => api.get('/user/notifications/unread-count'),
  markNotificationRead: (id: string) => api.post(`/user/notifications/${id}/read`),
};

export default userService;
