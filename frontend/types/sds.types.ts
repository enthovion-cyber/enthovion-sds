export type SdsStatus = 'draft' | 'pending_review' | 'approved';
export type Jurisdiction = 'US_OSHA' | 'EU_CLP' | 'UK_HSE' | 'AU_WHS' | 'CA_WHMIS' | 'SA_SASO' | 'CN_GB';

export interface SdsDocument {
  id: string;
  chemicalName: string;
  casNumber?: string;
  formula?: string;
  language: string;
  jurisdiction: Jurisdiction;
  status: SdsStatus;
  version: number;
  complianceScore?: number;
  sections?: Record<string, { title: string; content: unknown }>;
  expiresAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SdsListItem {
  id: string;
  chemicalName: string;
  casNumber?: string;
  language: string;
  jurisdiction: string;
  status: SdsStatus;
  version: number;
  complianceScore?: number;
  expiresAt?: string;
  updatedAt: string;
}

export interface GenerateSdsInput {
  chemicalName?: string;
  casNumber?: string;
  formula?: string;
  jurisdiction: Jurisdiction;
  language: string;
  manufacturer?: string;
  productCode?: string;
  additionalContext?: string;
}

export interface SdsDashboardStats {
  total: number;
  approved: number;
  draft: number;
  expiringSoon: number;
  avgComplianceScore: number;
  nonCompliant: number;
}
