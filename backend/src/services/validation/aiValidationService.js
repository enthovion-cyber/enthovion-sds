/**
 * AI Validation Engine
 * Scores SDS completeness, detects conflicts, assigns confidence score
 */
const { openai } = require('../ai/openaiService');
const { detectConflicts } = require('../compliance/Regulatoryengine');
const env = require('../../config/env');

const SECTION_WEIGHTS = {
  section1: 5, section2: 20, section3: 15, section4: 10, section5: 5,
  section6: 5, section7: 5,  section8: 15, section9: 8,  section10: 3,
  section11: 8, section12: 3, section13: 2, section14: 5, section15: 3, section16: 2,
};

const REQUIRED_FIELDS_BY_SECTION = {
  section1:  ['product_identifier', 'supplier_name', 'supplier_phone', 'emergency_phone'],
  section2:  ['ghs_classification', 'signal_word', 'hazard_statements', 'precautionary_statements', 'pictograms'],
  section3:  ['substance_or_mixture', 'chemical_name', 'cas_number', 'molecular_formula'],
  section4:  ['inhalation', 'skin_contact', 'eye_contact', 'ingestion', 'notes_to_physician'],
  section5:  ['suitable_extinguishing_media', 'unsuitable_extinguishing_media', 'specific_hazards', 'protective_equipment_for_firefighters'],
  section6:  ['personal_precautions', 'environmental_precautions', 'containment_methods', 'cleanup_methods'],
  section7:  ['handling_precautions', 'storage_conditions', 'incompatible_materials'],
  section8:  ['exposure_limits', 'engineering_controls', 'respiratory_protection', 'hand_protection', 'eye_protection', 'skin_body_protection'],
  section9:  ['physical_state', 'colour', 'odour', 'flash_point', 'boiling_point', 'vapour_pressure', 'relative_density', 'solubility_water'],
  section10: ['reactivity', 'chemical_stability', 'conditions_to_avoid', 'incompatible_materials', 'hazardous_decomposition_products'],
  section11: ['routes_of_exposure', 'acute_toxicity_oral', 'skin_corrosion_irritation', 'serious_eye_damage', 'carcinogenicity_iarc'],
  section12: ['aquatic_toxicity_fish', 'persistence_degradability', 'bioaccumulation'],
  section13: ['waste_treatment_methods', 'waste_codes_eu'],
  section14: ['un_number', 'proper_shipping_name', 'hazard_class', 'packing_group'],
  section15: ['eu_reach_clp', 'us_tsca'],
  section16: ['preparation_date', 'revision_date', 'disclaimer'],
};

const PLACEHOLDER_VALUES = [
  '', 'not determined', '[data required]', 'tbd', 'n/a', 'unknown',
  'provide value', 'specify', '...', 'placeholder', 'fill in',
];

const isValueReal = (val) => {
  if (!val) return false;
  if (Array.isArray(val)) return val.length > 0 && val.some(v => isValueReal(v));
  if (typeof val === 'object') return Object.keys(val).length > 0;
  const str = String(val).toLowerCase().trim();
  return str.length > 2 && !PLACEHOLDER_VALUES.some(p => str === p || str.startsWith(p));
};

const normalizeSectionKey = (key) => {
  if (!key) return null;
  const raw = String(key).toLowerCase().trim();
  const digitMatch = raw.match(/(\d{1,2})/);
  if (!digitMatch) return null;
  const idx = Number(digitMatch[1]);
  if (!Number.isFinite(idx) || idx < 1 || idx > 16) return null;
  return `section${idx}`;
};

const normalizeSections = (sections = {}) => {
  const normalized = {};
  Object.entries(sections || {}).forEach(([key, value]) => {
    const normalizedKey = normalizeSectionKey(key) || key;
    if (!normalized[normalizedKey]) {
      normalized[normalizedKey] = value;
    }
  });
  return normalized;
};

/**
 * Calculates weighted completeness and confidence score
 */
const scoreDocument = (sdsDocument) => {
  const sections = normalizeSections(sdsDocument.sections || {});
  const sectionScores = {};
  let totalWeight = 0;
  let weightedScore = 0;
  const missingItems = [];
  const presentItems = [];

  for (const [sKey, requiredFields] of Object.entries(REQUIRED_FIELDS_BY_SECTION)) {
    const section = sections[sKey];
    const content = section?.content || section || {};
    const weight = SECTION_WEIGHTS[sKey] || 5;
    totalWeight += weight;

    if (!section) {
      sectionScores[sKey] = { score: 0, weight, present: 0, total: requiredFields.length, status: 'missing' };
      missingItems.push({ section: sKey, severity: 'critical', issue: `Section ${sKey.replace('section', '')} is entirely missing` });
      continue;
    }

    let present = 0;
    for (const field of requiredFields) {
      if (isValueReal(content[field])) {
        present++;
        presentItems.push({ section: sKey, field });
      } else {
        const sectionNum = sKey.replace('section', '');
        const severity = parseInt(sectionNum) <= 3 || sKey === 'section8' ? 'critical' : parseInt(sectionNum) <= 8 ? 'major' : 'minor';
        missingItems.push({ section: sKey, field, severity, issue: `${field.replace(/_/g, ' ')} is missing or incomplete in Section ${sectionNum}` });
      }
    }

    const sectionPct = requiredFields.length > 0 ? present / requiredFields.length : 1;
    sectionScores[sKey] = { score: Math.round(sectionPct * 100), weight, present, total: requiredFields.length, status: sectionPct === 1 ? 'complete' : sectionPct >= 0.7 ? 'partial' : 'incomplete' };
    weightedScore += sectionPct * weight;
  }

  const rawScore = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;
  const conflicts = detectConflicts(sdsDocument);
  const conflictPenalty = conflicts.filter(c => c.severity === 'critical').length * 5;
  const finalScore = Math.max(0, Math.min(100, rawScore - conflictPenalty));

  return {
    overall_score: finalScore,
    completeness_percent: rawScore,
    confidence_label: finalScore >= 90 ? 'High Confidence ✅' : finalScore >= 70 ? 'Moderate Confidence ⚠️' : 'Low Confidence ❌',
    classification_certainty: finalScore >= 85 ? 'High' : finalScore >= 65 ? 'Moderate' : 'Low',
    status: finalScore >= 85 ? 'validation_passed' : finalScore >= 60 ? 'validation_partial' : 'validation_failed',
    status_label: finalScore >= 85 ? 'Compliance Passed ✅' : finalScore >= 60 ? 'Review Required ⚠️' : 'Compliance Failed ❌',
    section_scores: sectionScores,
    missing_items: missingItems,
    conflicts,
    critical_count: missingItems.filter(m => m.severity === 'critical').length + conflicts.filter(c => c.severity === 'critical').length,
    total_fields_checked: Object.values(REQUIRED_FIELDS_BY_SECTION).flat().length,
    total_fields_present: presentItems.length,
    validated_at: new Date().toISOString(),
  };
};

/**
 * AI-powered deep validation — checks accuracy of values, not just presence
 */
const aiDeepValidate = async (sdsDocument) => {
  const basicScore = scoreDocument(sdsDocument);

  const prompt = `You are a chemical safety expert validating an SDS for accuracy and consistency.

SDS: ${sdsDocument.chemical_name} (CAS: ${sdsDocument.cas_number || 'N/A'})
Section 2 (Hazard): ${JSON.stringify(sdsDocument.sections?.section2?.content || {})}
Section 8 (Exposure): ${JSON.stringify(sdsDocument.sections?.section8?.content || {})}
Section 9 (Physical): ${JSON.stringify(sdsDocument.sections?.section9?.content || {})}
Section 11 (Toxicology): ${JSON.stringify(sdsDocument.sections?.section11?.content || {})}

Check:
1. Are H-statements consistent with the hazard classifications listed?
2. Are the physical properties internally consistent (e.g. flash point vs flammability classification)?
3. Are the exposure limits current and from authoritative sources?
4. Are the precautionary statements appropriate for the stated hazards?
5. Is any data suspicious, implausible, or likely hallucinated?

Return JSON:
{
  "accuracy_issues": [{ "section": "section2", "field": "hazard_statements", "issue": "H225 listed but substance has flash point >60°C — inconsistent", "severity": "critical" }],
  "accuracy_score": 85,
  "suspicious_values": ["list any values that seem wrong or implausible"],
  "verification_recommendations": ["Verify flash point experimentally", "Check latest ACGIH TLV publication"],
  "ai_confidence_note": "Overall reliability assessment"
}
Return ONLY JSON.`;

  try {
    const response = await openai.chat.completions.create({
      model: env.ai.openaiModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });
    const aiResult = JSON.parse(response.choices[0].message.content);
    return { ...basicScore, ai_accuracy_check: aiResult };
  } catch (e) {
    return { ...basicScore, ai_accuracy_check: null };
  }
};

module.exports = { scoreDocument, aiDeepValidate, REQUIRED_FIELDS_BY_SECTION };