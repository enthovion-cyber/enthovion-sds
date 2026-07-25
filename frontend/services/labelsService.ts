// services/labelService.ts

import api from "@/lib/api";

const handleError = (error: any) => {
  return Promise.reject(
    error?.response?.data?.message || "Something went wrong"
  );
};

// 🔹 Generate label
const generate = (sdsId: string, size: string, language: string) => {
  return api
    .post(`/labels/${sdsId}/generate`, { size, language })
    .catch(handleError);
};

// 🔹 Preview label (HTML)
const preview = (sdsId: string, size: string, language: string) => {
  return api
    .get(`/labels/${sdsId}/preview`, {
      params: { size, language },
      responseType: "text",
    })
    .catch(handleError);
};

// 🔹 Export PDF
const exportPdf = (sdsId: string, size: string, language: string) => {
  return api
    .get(`/labels/${sdsId}/export`, {
      params: { size, language },
      responseType: "blob", // 🔥 important
    })
    .catch(handleError);
};

// 🔹 Get labels for SDS
const getBySds = (sdsId: string) => {
  return api.get(`/labels/${sdsId}`).catch(handleError);
};

// 🔹 Get all labels (paginated)
const getAll = (page = 1, limit = 20) => {
  return api
    .get(`/labels`, { params: { page, limit } })
    .catch(handleError);
};

// 🔹 Get available sizes
const getSizes = () => {
  return api.get(`/labels/sizes`).catch(handleError);
};

export default {
  generate,
  preview,
  exportPdf,
  getBySds,
  getAll,
  getSizes,
};