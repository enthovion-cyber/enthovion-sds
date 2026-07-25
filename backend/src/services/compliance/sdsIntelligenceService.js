const REGULATION_HINTS = [
  { key: "EU_CLP", tokens: ["clp", "1272/2008", "ec no", "eu"] },
  { key: "US_OSHA", tokens: ["osha", "29 cfr", "hazcom", "usa"] },
  { key: "UK_HSE", tokens: ["hse", "uk", "gb"] },
];

const ENTITY_HAZARD_KEYWORDS = [
  { token: "flammable", hCode: "H225", hazardClass: "Flammable Liquids" },
  { token: "toxic", hCode: "H301", hazardClass: "Acute Toxicity" },
  { token: "corrosive", hCode: "H314", hazardClass: "Skin Corrosion" },
  { token: "carcinogen", hCode: "H350", hazardClass: "Carcinogenicity" },
  { token: "aquatic", hCode: "H411", hazardClass: "Aquatic Chronic" },
];

const parseCompositionEntities = (sections = {}) => {
  const section3 = sections.section3?.content || {};
  const list =
    section3.components ||
    section3.ingredients ||
    section3.substances ||
    [];

  if (!Array.isArray(list)) return [];

  return list.map((item, index) => ({
    id: `cmp-${index + 1}`,
    chemical_name: item.chemical_name || item.name || "Unknown",
    cas_number: item.cas_number || item.cas || null,
    concentration_percent: item.concentration_percent || item.concentration || null,
  }));
};

const detectRegulations = (sections = {}, fallbackJurisdiction = "US_OSHA") => {
  const joined = JSON.stringify(sections).toLowerCase();
  const mapped = REGULATION_HINTS.filter((r) =>
    r.tokens.some((token) => joined.includes(token))
  ).map((r) => r.key);

  if (!mapped.length) return [fallbackJurisdiction];
  return [...new Set(mapped)];
};

const linkHazards = (sections = {}) => {
  const section2 = sections.section2?.content || {};
  const blob = JSON.stringify(section2).toLowerCase();
  const linked = ENTITY_HAZARD_KEYWORDS.filter((h) => blob.includes(h.token)).map((h) => ({
    h_code: h.hCode,
    hazard_class: h.hazardClass,
    reason: `Detected keyword "${h.token}" in hazard section`,
  }));
  return linked;
};

const buildSdsIntelligenceModel = ({ extracted, sourceFilePath }) => {
  const entities = parseCompositionEntities(extracted.sections);
  const hazards = linkHazards(extracted.sections);
  const regulations = detectRegulations(
    extracted.sections,
    extracted.detected_jurisdiction || "US_OSHA"
  );

  return {
    metadata: {
      source_file: sourceFilePath,
      extracted_at: new Date().toISOString(),
      extraction_confidence: extracted.extraction_confidence || 0,
      chemical_name: extracted.chemical_name || "Unknown",
      cas_number: extracted.cas_number || null,
    },
    entities,
    hazard_links: hazards,
    regulation_mapping: regulations.map((reg) => ({
      framework: reg,
      status: "tracked",
    })),
    query_index: {
      hazard_codes: hazards.map((h) => h.h_code),
      cas_numbers: entities.map((e) => e.cas_number).filter(Boolean),
      component_names: entities.map((e) => e.chemical_name),
    },
  };
};

module.exports = { buildSdsIntelligenceModel };
