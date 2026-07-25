import api from '@/lib/api';
import type { Jurisdiction } from '@/utils/constants';

const BASE_PATH = '/compliance'; 

const complianceService = {
  // --- Core Auditing ---
  auditSds: (id: string, jurisdiction: Jurisdiction = 'US_OSHA') => {
    return api.post(`${BASE_PATH}/audit/${id}`, {}, { 
      params: { jurisdiction } 
    });
  },
  
  auditLibrary: (jurisdiction: Jurisdiction = 'US_OSHA') => {
    return api.post(`${BASE_PATH}/audit-library`, {}, { 
      params: { jurisdiction } 
    });
  },
  
  getReport: (sdsId: string, jurisdiction?: Jurisdiction) => {
    return api.get(`${BASE_PATH}/report/${sdsId}`, { 
      params: { jurisdiction } 
    });
  },

  // --- Continuous Compliance ---
  executePipeline: () => api.post(`${BASE_PATH}/pipeline/execute`, {}),
  getContinuousStatus: () => api.get(`${BASE_PATH}/continuous/status`),
  getGlobalSnapshot: () => api.get(`${BASE_PATH}/continuous/global-snapshot`),

  // --- Workflow & Auto-Fix ---
  // FIXED: Renamed previewAutoFix -> getAutoFixPreview to match component usage
  getAutoFixPreview: (id: string) => api.get(`${BASE_PATH}/auto-fix-preview/${id}`),
  
  // Optional alias in case previewAutoFix is called elsewhere in the codebase
  previewAutoFix: (id: string) => api.get(`${BASE_PATH}/auto-fix-preview/${id}`),

  startAutoFixWorkflow: (id: string) => api.post(`${BASE_PATH}/workflow/auto-fix/${id}`, {}),
  getWorkflowTasks: () => api.get(`${BASE_PATH}/workflow/tasks`),
  approveTask: (taskId: string) => api.post(`${BASE_PATH}/workflow/tasks/${taskId}/approve`, {}),
  rejectTask: (taskId: string) => api.post(`${BASE_PATH}/workflow/tasks/${taskId}/reject`, {})
};

export default complianceService;