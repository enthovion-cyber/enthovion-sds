import api from '@/lib/api';
import type { GenerateSopInput } from '@/types/sop.types';

const sopService = {
  getAll: (params?: Record<string, unknown>) => api.get('/sop', { params }),
  getById: (id: string) => api.get(`/sop/${id}`),
  generate: (data: GenerateSopInput) => api.post('/sop/generate', data),
  update: (id: string, data: unknown) => api.put(`/sop/${id}`, data),
  export: (id: string) => api.get(`/sop/${id}/export`, { responseType: 'blob' }),
};

export default sopService;
