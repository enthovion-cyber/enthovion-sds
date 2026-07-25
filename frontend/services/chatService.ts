import api from '@/lib/api';
import type { SendMessageInput } from '@/types/chat.types';

const chatService = {
  sendMessage: (data: SendMessageInput) => api.post('/chat/message', data),
  getHistory: (sdsId: string) => api.get(`/chat/history/${sdsId}`),
};

export default chatService;
