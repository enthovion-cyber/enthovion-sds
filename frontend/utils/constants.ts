export const JURISDICTIONS = [
  { value: 'US_OSHA', label: 'US OSHA HazCom 2012' },
  { value: 'EU_CLP',  label: 'EU CLP Regulation' },
  { value: 'UK_HSE',  label: 'UK GB CLP / EH40' },
  { value: 'AU_WHS',  label: 'Australia WHS' },
  { value: 'CA_WHMIS',label: 'Canada WHMIS 2015' },
  { value: 'SA_SASO', label: 'Saudi SASO / GCC' },
  { value: 'CN_GB',   label: 'China GB/T 16483' },
] as const;

export const LANGUAGES = [
  { value: 'en', label: 'English',   rtl: false },
  { value: 'ar', label: 'العربية',   rtl: true  },
  { value: 'fr', label: 'Français',  rtl: false },
  { value: 'de', label: 'Deutsch',   rtl: false },
  { value: 'es', label: 'Español',   rtl: false },
  { value: 'pt', label: 'Português', rtl: false },
  { value: 'zh', label: '中文',      rtl: false },
  { value: 'ja', label: '日本語',    rtl: false },
  { value: 'ko', label: '한국어',    rtl: false },
  { value: 'hi', label: 'हिंदी',     rtl: false },
  { value: 'ur', label: 'اردو',      rtl: true  },
] as const;

export const SOP_TYPES = [
  { value: 'handling',  label: 'Safe Handling' },
  { value: 'emergency', label: 'Emergency Response' },
  { value: 'spill',     label: 'Spill Procedure' },
  { value: 'disposal',  label: 'Disposal' },
  { value: 'storage',   label: 'Storage' },
] as const;

export const COMPLIANCE_THRESHOLDS = {
  compliant:   90,
  acceptable:  80,
  needsUpdate: 60,
  critical:    0,
} as const;

export const APP_NAME = 'SafeSheet AI';

// --- Extracted Types for use throughout your app ---
export type Jurisdiction = typeof JURISDICTIONS[number]['value'];
// Types as: 'US_OSHA' | 'EU_CLP' | 'UK_HSE' | 'AU_WHS' | 'CA_WHMIS' | 'SA_SASO' | 'CN_GB'

export type LanguageCode = typeof LANGUAGES[number]['value'];
// Types as: 'en' | 'ar' | 'fr' | 'de' | 'es' | 'pt' | 'zh' | 'ja' | 'ko' | 'hi' | 'ur'

export type SopType = typeof SOP_TYPES[number]['value'];
// Types as: 'handling' | 'emergency' | 'spill' | 'disposal' | 'storage'