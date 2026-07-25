import api from "@/lib/api";

const handleError = (error: any) => {
  return Promise.reject(
    error?.response?.data?.message || "Something went wrong"
  );
};

const create = (data: any) => {
  return api.post(`/compliance/mixtures`, data).catch(handleError);
};

const getAll = (page = 1, limit = 20) => {
  return api
    .get(`/compliance/mixtures`, { params: { page, limit } })
    .catch(handleError);
};

const getById = (id: string) => {
  return api.get(`/compliance/mixtures/${id}`).catch(handleError);
};

const update = (id: string, data: any) => {
  return api.put(`/compliance/mixtures/${id}`, data).catch(handleError);
};

const deleteMixture = (id: string) => {
  return api.delete(`/compliance/mixtures/${id}`).catch(handleError);
};

const calculate = (id: string) => {
  return api.post(`/compliance/mixtures/${id}/calculate`).catch(handleError);
};

const autoFillComponent = (payload: { cas_number?: string; chemical_name?: string }) => {
  return api.post(`/compliance/mixtures/auto-fill-component`, payload).catch(handleError);
};

const simulate = (id: string, payload: { componentId: string; concentrationPercent: number }) => {
  return api.post(`/compliance/mixtures/${id}/simulate`, payload).catch(handleError);
};

const optimize = (id: string, payload: { goal: string }) => {
  return api.post(`/compliance/mixtures/${id}/optimize`, payload).catch(handleError);
};

const runPipeline = (payload: { inputType: "sds" | "mixture" | "chemical"; sdsId?: string; mixtureId?: string; chemical?: string }) => {
  return api.post(`/compliance/pipeline/execute`, payload).catch(handleError);
};

export default {
  create,
  getAll,
  getById,
  update,
  delete: deleteMixture,
  calculate,
  autoFillComponent,
  simulate,
  optimize,
  runPipeline,
};