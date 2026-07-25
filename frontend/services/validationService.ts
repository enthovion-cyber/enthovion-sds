import api from "@/lib/api"; // axios instance with auth token

const validationService = {
  // Quick rule-based score
  score: (sdsId: string) => {
    return api.post(`/validation/score/${sdsId}`);
  },

  // Deep AI validation
  deepValidate: (sdsId: string) => {
    return api.post(`/validation/deep/${sdsId}`);
  },

  // Get conflicts only
  getConflicts: (sdsId: string) => {
    return api.get(`/validation/conflicts/${sdsId}`);
  },

  // Get latest validation
  getLatest: (sdsId: string) => {
    return api.get(`/validation/latest/${sdsId}`);
  },

  // Get all validations (paginated)
  getAll: (params?: { page?: number; limit?: number }) => {
    return api.get(`/validation`, { params });
  },
};

export default validationService;