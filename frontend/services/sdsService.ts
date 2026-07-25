import api from '@/lib/api';
import type { GenerateSdsInput } from '@/types/sds.types';

const sdsService = {
  getAll: (params?: Record<string, unknown>) => api.get('/sds', { params }),
  getById: (id: string) => api.get(`/sds/${id}`),
  generate: (data: GenerateSdsInput) => api.post('/sds/generate', data),
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/sds/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  update: (id: string, data: unknown) => api.put(`/sds/${id}`, data),
  delete: (id: string) => api.delete(`/sds/${id}`),
  approve: (id: string) => api.post(`/sds/${id}/approve`),
  export: (id: string) => api.get(`/sds/${id}/export`, { responseType: 'blob' }),
  search: (params: Record<string, unknown>) => api.get('/sds/search', { params }),
  getDashboardStats: () => api.get('/user/dashboard-stats'),
  getExpiring: (days?: number) => api.get('/user/expiring-sds', { params: { days } }),
};

export default sdsService;
