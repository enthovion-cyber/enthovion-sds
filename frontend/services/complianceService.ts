import api from '@/lib/api';

const BASE_PATH = '/compliance'; 

const complianceService = {
  // --- Core Auditing ---
  // FIXED: Changed second argument from `null` to an empty object `{}`
  auditSds: (id: string, jurisdiction = 'US_OSHA') => {
    return api.post(`${BASE_PATH}/audit/${id}`, {}, { 
      params: { jurisdiction } 
    });
  },
  
  // FIXED: Changed second argument from `null` to an empty object `{}`
  auditLibrary: (jurisdiction = 'US_OSHA') => {
    return api.post(`${BASE_PATH}/audit-library`, {}, { 
      params: { jurisdiction } 
    });
  },
  
  getReport: (sdsId: string, jurisdiction?: string) => {
    return api.get(`${BASE_PATH}/report/${sdsId}`, { 
      params: { jurisdiction } 
    });
  },

  // --- Continuous Compliance ---
  executePipeline: () => api.post(`${BASE_PATH}/pipeline/execute`, {}),
  getContinuousStatus: () => api.get(`${BASE_PATH}/continuous/status`),
  getGlobalSnapshot: () => api.get(`${BASE_PATH}/continuous/global-snapshot`),

  // --- Workflow & Auto-Fix ---
  previewAutoFix: (id: string) => api.get(`${BASE_PATH}/auto-fix-preview/${id}`),
  startAutoFixWorkflow: (id: string) => api.post(`${BASE_PATH}/workflow/auto-fix/${id}`, {}),
  getWorkflowTasks: () => api.get(`${BASE_PATH}/workflow/tasks`),
  approveTask: (taskId: string) => api.post(`${BASE_PATH}/workflow/tasks/${taskId}/approve`, {}),
  rejectTask: (taskId: string) => api.post(`${BASE_PATH}/workflow/tasks/${taskId}/reject`, {})
};

export default complianceService;