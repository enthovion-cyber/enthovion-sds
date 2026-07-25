import api from "@/lib/api"; // adjust path if needed

// Types (optional but recommended)
export interface ClassifyPayload {
  chemicalName?: string;
  casNumber?: string;
  formula?: string;
  physicalProperties?: Record<string, any>;
  toxicologyData?: Record<string, any>;
}

export type Jurisdiction =
  | "US_OSHA"
  | "EU_CLP"
  | "UK_HSE"
  | "AU_WHS"
  | "CA_WHMIS"
  | "SA_SASO"
  | "CN_GB";

const regulatoryService = {
  // ─────────────────────────────────────────────
  // Hazard Classification
  // POST /regulatory/classify
  // ─────────────────────────────────────────────
  classify: (payload: ClassifyPayload) => {
    return api.post("/regulatory/classify", payload);
  },

  // ─────────────────────────────────────────────
  // Validate SDS
  // GET /regulatory/validate/:id?jurisdiction=...
  // ─────────────────────────────────────────────
  validateSds: (sdsId: string, jurisdiction: Jurisdiction = "US_OSHA") => {
    return api.get(`/regulatory/validate/${sdsId}`, {
      params: { jurisdiction },
    });
  },

  // ─────────────────────────────────────────────
  // Get Regulatory Updates
  // GET /regulatory/updates
  // ─────────────────────────────────────────────
  getUpdates: () => {
    return api.get("/regulatory/updates");
  },

  // ─────────────────────────────────────────────
  // Get Frameworks
  // GET /regulatory/frameworks
  // ─────────────────────────────────────────────
  getFrameworks: () => {
    return api.get("/regulatory/frameworks");
  },

  // ─────────────────────────────────────────────
  // Get SDS Review Status
  // GET /regulatory/review-status/:id
  // ─────────────────────────────────────────────
  getSdsReviewStatus: (sdsId: string) => {
    return api.get(`/regulatory/review-status/${sdsId}`);
  },
};

export default regulatoryService;