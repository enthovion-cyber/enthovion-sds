const { openai } = require('./openaiService');
const env = require('../../config/env');
const pubchemService = require('../regulatory/pubchemService');

const JURISDICTION_RULES = {
  US_OSHA:  'OSHA HazCom 2012 (29 CFR 1910.1200), GHS Rev 3. Include OSHA PEL and ACGIH TLV-TWA.',
  EU_CLP:   'EU CLP Regulation (EC) No 1272/2008 with REACH. Use ECHA harmonised classification.',
  UK_HSE:   'UK GB CLP (post-Brexit). REACH UK, EH40 Workplace Exposure Limits.',
  AU_WHS:   'Australian WHS Regulations 2011. Safe Work Australia Workplace Exposure Standards.',
  CA_WHMIS: 'Canada WHMIS 2015 / GHS. Canadian OELs.',
  SA_SASO:  'Saudi SASO GSO-1651 / GHS Rev 7. Arabic bilingual text required.',
  CN_GB:    'China GB/T 16483-2008. Include Chinese chemical name and CAS Pinyin.',
};

const PICTOGRAM_RULES = [
  { test: /h2(2[0-8]|3\d|4\d)|flammable|combustible|fire/i, pictogram: 'GHS02 - Flame' },
  { test: /oxid/i, pictogram: 'GHS03 - Flame Over Circle' },
  { test: /h280|compressed gas|gas under pressure/i, pictogram: 'GHS04 - Gas Cylinder' },
  { test: /h290|h314|corros/i, pictogram: 'GHS05 - Corrosion' },
  { test: /h300|h301|h310|h311|h330|h331|fatal|toxic if swallowed/i, pictogram: 'GHS06 - Skull and Crossbones' },
  { test: /h302|h312|h315|h317|h319|h332|h335|irrit/i, pictogram: 'GHS07 - Exclamation Mark' },
  { test: /h304|h334|h340|h341|h350|h351|h360|h361|h370|h372|aspiration|carcin/i, pictogram: 'GHS08 - Health Hazard' },
  { test: /h400|h410|h411|h412|aquatic|environment/i, pictogram: 'GHS09 - Environmental Hazard' },
];

const ensurePictograms = (section2 = {}) => {
  const content = section2.content || section2;
  const existing = Array.isArray(content.pictograms) ? content.pictograms.filter(Boolean) : [];
  if (existing.length > 0) return existing;

  const sourceText = [
    ...(Array.isArray(content.hazard_statements) ? content.hazard_statements : []),
    ...(Array.isArray(content.ghs_classification) ? content.ghs_classification : []),
    content.signal_word || '',
    content.other_hazards || '',
  ].join(' ');

  const inferred = PICTOGRAM_RULES
    .filter((rule) => rule.test.test(sourceText))
    .map((rule) => rule.pictogram);

  if (inferred.length) return Array.from(new Set(inferred));
  if (String(content.signal_word || '').toUpperCase() === 'DANGER') {
    return ['GHS07 - Exclamation Mark'];
  }
  return ['GHS07 - Exclamation Mark'];
};

const generateSds = async ({ chemicalName, casNumber, formula, jurisdiction = 'US_OSHA', language = 'en', manufacturer, productCode, additionalContext }) => {
  let pubchemInfo = '';
  if (casNumber || chemicalName) {
    try {
      const data = await pubchemService.getCompoundData(casNumber || chemicalName);
      if (data.summary) pubchemInfo = `\nVerified PubChem data: ${JSON.stringify(data.summary)}`;
    } catch (e) { console.warn('[SDS] PubChem lookup failed:', e.message); }
  }

  const jurisdictionRule = JURISDICTION_RULES[jurisdiction] || JURISDICTION_RULES.US_OSHA;

  const prompt = `You are a senior certified chemical safety expert. Generate a COMPLETE, DETAILED, PROFESSIONAL 16-section GHS Safety Data Sheet for "${chemicalName || casNumber || formula}".

CHEMICAL: ${chemicalName || 'Unknown'} | CAS: ${casNumber || 'Not specified'} | Formula: ${formula || 'Not specified'}
Manufacturer: ${manufacturer || 'Customer Name'} | Product Code: ${productCode || 'N/A'}
Regulatory Standard: ${jurisdictionRule}
Language: ${language === 'ar' ? 'Arabic (العربية) — write ALL text in Arabic' : language.toUpperCase()}
${additionalContext ? `Additional context: ${additionalContext}` : ''}
${pubchemInfo}

RULES:
- Every field MUST have REAL, SPECIFIC content — no empty strings, no placeholder text
- Use actual GHS H-statements with official wording (H200-H420 range)
- Use actual GHS P-statements with official wording
- Include real physical property values with units
- Include real OELs with ppm/mg/m3 values and sources
- PPE must be specific (brand/type/standard, not just "gloves")
- If truly unknown write "Not determined" — never leave blank

Return a JSON object with this structure (fill every single field with REAL data for this specific chemical):
{
  "chemical_name": "...",
  "cas_number": "...",
  "formula": "...",
  "language": "${language}",
  "jurisdiction": "${jurisdiction}",
  "sections": {
    "section1": { "title": "Identification", "content": { "product_identifier": "...", "synonyms": "...", "recommended_uses": "...", "uses_advised_against": "...", "supplier_name": "...", "supplier_address": "...", "supplier_phone": "...", "emergency_phone": "CHEMTREC: +1-800-424-9300 (24h)", "sds_revision_date": "${new Date().toLocaleDateString()}" } },
    "section2": { "title": "Hazard Identification", "content": { "ghs_classification": ["...", "..."], "signal_word": "DANGER or WARNING", "hazard_statements": ["H-code: full official text", "..."], "precautionary_statements": { "prevention": ["P-code: full text", "..."], "response": ["P-code: full text", "..."], "storage": ["P-code: full text"], "disposal": ["P501: full text"] }, "pictograms": ["GHS0x - Name", "..."], "other_hazards": "..." } },
    "section3": { "title": "Composition / Information on Ingredients", "content": { "substance_or_mixture": "Substance", "chemical_name": "...", "synonyms": "...", "cas_number": "...", "ec_number": "...", "molecular_formula": "...", "molecular_weight": "... g/mol", "ingredients": [ { "component": "...", "cas": "...", "ec": "...", "concentration": "...%", "classification": "..." } ] } },
    "section4": { "title": "First-Aid Measures", "content": { "inhalation": "...", "skin_contact": "...", "eye_contact": "...", "ingestion": "...", "most_important_symptoms": "...", "medical_attention": "...", "notes_to_physician": "..." } },
    "section5": { "title": "Fire-Fighting Measures", "content": { "suitable_extinguishing_media": "...", "unsuitable_extinguishing_media": "...", "specific_hazards": "...", "protective_equipment_for_firefighters": "...", "hazchem_code": "..." } },
    "section6": { "title": "Accidental Release Measures", "content": { "personal_precautions": "...", "environmental_precautions": "...", "containment_methods": "...", "cleanup_methods": "...", "reference_other_sections": "See Section 8 for PPE. See Section 13 for disposal." } },
    "section7": { "title": "Handling and Storage", "content": { "handling_precautions": "...", "storage_conditions": "...", "storage_temperature": "...", "incompatible_materials": "...", "packaging_materials": "..." } },
    "section8": { "title": "Exposure Controls / Personal Protection", "content": { "exposure_limits": [ { "substance": "...", "cas": "...", "osha_pel": "... ppm / ... mg/m3 (8h TWA)", "acgih_tlv": "... ppm / ... mg/m3 (TWA)", "niosh_rel": "... ppm", "basis": "..." } ], "engineering_controls": "...", "respiratory_protection": "...", "hand_protection": "...", "eye_protection": "...", "skin_body_protection": "...", "hygiene_measures": "..." } },
    "section9": { "title": "Physical and Chemical Properties", "content": { "physical_state": "...", "colour": "...", "odour": "...", "odour_threshold": "...", "ph": "...", "melting_point": "...", "boiling_point": "...", "flash_point": "...", "evaporation_rate": "...", "flammability": "...", "upper_flammability_limit": "...%", "lower_flammability_limit": "...%", "vapour_pressure": "...", "vapour_density": "...", "relative_density": "...", "solubility_water": "...", "partition_coefficient_log_kow": "...", "auto_ignition_temperature": "...", "decomposition_temperature": "...", "viscosity": "..." } },
    "section10": { "title": "Stability and Reactivity", "content": { "reactivity": "...", "chemical_stability": "...", "hazardous_reactions": "...", "conditions_to_avoid": ["...", "..."], "incompatible_materials": ["...", "..."], "hazardous_decomposition_products": ["...", "..."] } },
    "section11": { "title": "Toxicological Information", "content": { "routes_of_exposure": "Inhalation, skin contact, eye contact, ingestion", "acute_toxicity_oral": "LD50 ... mg/kg (rat)", "acute_toxicity_dermal": "LD50 ... mg/kg (rat)", "acute_toxicity_inhalation": "LC50 ... mg/L/4h (rat)", "skin_corrosion_irritation": "...", "serious_eye_damage": "...", "respiratory_sensitisation": "...", "skin_sensitisation": "...", "germ_cell_mutagenicity": "...", "carcinogenicity_iarc": "Group ...", "carcinogenicity_ntp": "...", "carcinogenicity_osha": "...", "reproductive_toxicity": "...", "stot_single_exposure": "...", "stot_repeated_exposure": "...", "aspiration_hazard": "...", "chronic_effects": "..." } },
    "section12": { "title": "Ecological Information", "content": { "aquatic_toxicity_fish": "LC50 ... mg/L/96h (...species)", "aquatic_toxicity_daphnia": "EC50 ... mg/L/48h", "aquatic_toxicity_algae": "EC50 ... mg/L/72h", "aquatic_classification": "...", "persistence_degradability": "...", "bioaccumulation": "BCF: ... log Kow: ...", "mobility_soil": "...", "other_adverse_effects": "..." } },
    "section13": { "title": "Disposal Considerations", "content": { "waste_treatment_methods": "...", "waste_codes_eu": "...", "waste_codes_us": "...", "contaminated_packaging": "...", "precautions": "..." } },
    "section14": { "title": "Transport Information", "content": { "un_number": "UN ...", "proper_shipping_name": "...", "hazard_class": "...", "packing_group": "I / II / III", "environmental_hazards": "Marine pollutant: Yes/No", "special_precautions": "...", "adr_road": "...", "imdg_sea": "...", "iata_air": "..." } },
    "section15": { "title": "Regulatory Information", "content": { "eu_reach_clp": "...", "us_tsca": "Listed on TSCA inventory", "us_sara": "...", "us_california_prop65": "...", "other_national_regulations": "..." } },
    "section16": { "title": "Other Information", "content": { "preparation_date": "${new Date().toLocaleDateString()}", "revision_date": "${new Date().toLocaleDateString()}", "revision_number": "1.0", "abbreviations": "ACGIH: American Conference of Governmental Industrial Hygienists | CAS: Chemical Abstracts Service | GHS: Globally Harmonised System | IARC: International Agency for Research on Cancer | LC50: Lethal Concentration 50% | LD50: Lethal Dose 50% | OEL: Occupational Exposure Limit | PEL: Permissible Exposure Limit | TLV: Threshold Limit Value | TWA: Time Weighted Average", "key_references": ["PubChem", "ECHA C&L Inventory", "GESTIS", "ACGIH TLVs and BEIs", "OSHA 29 CFR 1910.1000"], "disclaimer": "Generated by SafeSheet AI. Requires review by a qualified EHS professional before use. Information based on data available at date of preparation." } }
  },
  "data_quality": { "completeness_percent": 90, "fields_requiring_review": ["Verify UN number in Section 14", "Verify OELs in Section 8 against latest publications"] }
}

Return ONLY raw JSON. No markdown. No code blocks.`;

  const response = await openai.chat.completions.create({
    model: env.ai.openaiModel,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.15,
    max_tokens: 8000,
    response_format: { type: 'json_object' },
  });

  let sdsData;
  try {
    sdsData = JSON.parse(response.choices[0].message.content);
  } catch (e) {
    throw new Error('SDS generation failed — invalid AI response. Please retry.');
  }

  if (!sdsData.sections) sdsData.sections = {};
  if (!sdsData.sections.section2) {
    sdsData.sections.section2 = { title: 'Hazard Identification', content: {} };
  }
  const section2 = sdsData.sections.section2;
  const section2Content = section2.content || section2;
  section2Content.pictograms = ensurePictograms(section2);
  sdsData.sections.section2 = {
    ...(section2.content ? section2 : { title: section2.title || 'Hazard Identification' }),
    content: section2Content,
  };

  return { ...sdsData, ai_model: 'gpt-4o-mini', tokens_used: response.usage?.total_tokens || 0, generated_at: new Date().toISOString() };
};

module.exports = { generateSds };