import api from '@/lib/api';

const BASE = '/sds'; // adjust if your route prefix differs

const getHistory = (sdsId: string) => {
  return api.get(`${BASE}/${sdsId}/versions`);
};

const compare = (sdsId: string, v1: number, v2: number) => {
  return api.get(`${BASE}/${sdsId}/versions/compare`, {
    params: { v1, v2 },
  });
};

const rollback = (sdsId: string, version: number) => {
  return api.post(`${BASE}/${sdsId}/versions/rollback`, {
    version,
  });
};

const exportAudit = (sdsId: string, format: 'json' | 'pdf') => {
  return api.get(`${BASE}/${sdsId}/versions/audit`, {
    params: { format },
    responseType: format === 'pdf' ? 'blob' : 'json',
  });
};

export default {
  getHistory,
  compare,
  rollback,
  exportAudit,
};