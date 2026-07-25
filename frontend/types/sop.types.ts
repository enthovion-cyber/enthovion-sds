export type SopType = 'handling' | 'emergency' | 'spill' | 'disposal' | 'storage';

export interface SopDocument {
  id: string;
  sdsId: string;
  language: string;
  type: SopType;
  title: string;
  status: 'draft' | 'approved';
  version: number;
  isRtl: boolean;
  content: SopContent;
  createdAt: string;
  updatedAt: string;
}

export interface SopContent {
  title: string;
  chemicalName: string;
  sopType: string;
  language: string;
  isRtl: boolean;
  requiredPpe: Array<{ item: string; specification: string; icon?: string }>;
  procedureSteps: Array<{ step: number; action: string; warning?: string; critical: boolean }>;
  emergencyProcedures: Record<string, string>;
  prohibitedActions: string[];
  emergencyContacts: Record<string, string>;
  reviewDate: string;
}

export interface GenerateSopInput {
  sdsId: string;
  language: string;
  type: SopType;
}
