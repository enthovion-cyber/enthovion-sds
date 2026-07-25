const { openai } = require('./openaiService');
const env = require('../../config/env');

const LANGUAGE_NAMES = {
  en: 'English', ar: 'Arabic (العربية)', fr: 'French (Français)', de: 'German (Deutsch)',
  es: 'Spanish (Español)', pt: 'Portuguese (Português)', zh: 'Chinese Simplified (中文)',
  ja: 'Japanese (日本語)', ko: 'Korean (한국어)', hi: 'Hindi (हिंदी)',
  ur: 'Urdu (اردو)', id: 'Bahasa Indonesia', tr: 'Turkish (Türkçe)',
  ru: 'Russian (Русский)', it: 'Italian (Italiano)', nl: 'Dutch (Nederlands)',
};

const SOP_TYPE_DESCRIPTIONS = {
  handling:  'Safe handling and use procedure for workers handling this chemical',
  emergency: 'Emergency response procedure for exposure incidents and accidents',
  spill:     'Spill containment and cleanup procedure for accidental releases',
  disposal:  'Safe disposal procedure for chemical waste and empty containers',
  storage:   'Safe storage requirements and conditions',
};

const generateSop = async ({ sdsData, language = 'en', type = 'handling', sdsId }) => {
  const languageName = LANGUAGE_NAMES[language] || 'English';
  const typeDescription = SOP_TYPE_DESCRIPTIONS[type] || 'Safe operating procedure';
  const isRTL = ['ar', 'ur', 'he'].includes(language);
  const isArabic = language === 'ar';

  // Build rich SDS context from all available sections
  const s = sdsData.sections || {};
  const sdsContext = {
    chemical_name: sdsData.chemical_name,
    cas_number: sdsData.cas_number,
    hazard_classification: s.section2?.content?.ghs_classification || s.section2?.ghs_classification || [],
    signal_word: s.section2?.content?.signal_word || s.section2?.signal_word || '',
    hazard_statements: s.section2?.content?.hazard_statements || s.section2?.hazard_statements || [],
    pictograms: s.section2?.content?.pictograms || s.section2?.pictograms || [],
    first_aid_inhalation: s.section4?.content?.inhalation || s.section4?.inhalation || '',
    first_aid_skin: s.section4?.content?.skin_contact || s.section4?.skin_contact || '',
    first_aid_eye: s.section4?.content?.eye_contact || s.section4?.eye_contact || '',
    first_aid_ingestion: s.section4?.content?.ingestion || s.section4?.ingestion || '',
    firefighting: s.section5?.content?.suitable_extinguishing_media || s.section5?.suitable_extinguishing_media || '',
    handling: s.section7?.content?.handling_precautions || s.section7?.handling_precautions || '',
    storage: s.section7?.content?.storage_conditions || s.section7?.storage_conditions || '',
    ppe_respiratory: s.section8?.content?.respiratory_protection || s.section8?.respiratory_protection || '',
    ppe_hands: s.section8?.content?.hand_protection || s.section8?.hand_protection || '',
    ppe_eyes: s.section8?.content?.eye_protection || s.section8?.eye_protection || '',
    ppe_body: s.section8?.content?.skin_body_protection || s.section8?.skin_body_protection || '',
    oels: s.section8?.content?.exposure_limits || s.section8?.exposure_limits || [],
    flash_point: s.section9?.content?.flash_point || s.section9?.flash_point || '',
    boiling_point: s.section9?.content?.boiling_point || s.section9?.boiling_point || '',
    incompatible: s.section10?.content?.incompatible_materials || s.section10?.incompatible_materials || [],
    spill_cleanup: s.section6?.content?.cleanup_methods || s.section6?.cleanup_methods || '',
    disposal: s.section13?.content?.waste_treatment_methods || s.section13?.waste_treatment_methods || '',
  };

  const prompt = `You are a senior EHS (Environment, Health and Safety) professional. Create a COMPREHENSIVE, DETAILED Standard Operating Procedure (SOP).

CHEMICAL: ${sdsData.chemical_name} (CAS: ${sdsData.cas_number || 'N/A'})
SOP TYPE: ${type} — ${typeDescription}
OUTPUT LANGUAGE: ${languageName}
${isArabic ? 'IMPORTANT: Write ALL content in Arabic (العربية). Use proper Arabic chemical safety terminology.' : ''}

SDS REFERENCE DATA:
${JSON.stringify(sdsContext, null, 2)}

Create a detailed, practical SOP that a worker can actually follow. Include specific, actionable steps.

Return ONLY a JSON object:
{
  "title": "${isArabic ? 'إجراء التشغيل الموحد: ' + sdsData.chemical_name : 'SOP: ' + type.toUpperCase() + ' — ' + sdsData.chemical_name}",
  "chemical_name": "${isArabic ? 'Arabic name of ' + sdsData.chemical_name : sdsData.chemical_name}",
  "cas_number": "${sdsData.cas_number || 'N/A'}",
  "sop_type": "${type}",
  "language": "${language}",
  "is_rtl": ${isRTL},
  "version": "1.0",
  "document_number": "SOP-${type.toUpperCase().slice(0,3)}-001",
  "effective_date": "${new Date().toISOString().split('T')[0]}",
  "review_date": "${new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0]}",
  "approved_by": "[EHS Manager Name]",
  "scope": "Detailed scope statement — who this SOP applies to, in what locations/situations",
  "purpose": "Clear purpose statement of what this SOP achieves and why it is needed",
  "hazard_summary": {
    "signal_word": "DANGER or WARNING",
    "main_hazards": ["list of 3-5 specific hazards for this chemical"],
    "health_hazards": "specific health effects description",
    "fire_hazards": "specific fire/explosion hazards",
    "environmental_hazards": "environmental hazard description"
  },
  "required_ppe": [
    { "item": "Specific PPE item name", "specification": "Exact specification (standard/material/grade)", "when_required": "Always / only when...", "icon": "gloves|goggles|respirator|apron|boots|hardhat|coverall" },
    { "item": "Safety goggles", "specification": "Chemical splash goggles, EN166/ANSI Z87.1 rated", "when_required": "Always when handling", "icon": "goggles" },
    { "item": "Nitrile gloves", "specification": "Nitrile rubber, minimum 0.11mm thickness, EN374 chemical resistance", "when_required": "Always when handling", "icon": "gloves" },
    { "item": "Respiratory protection", "specification": "Organic vapour respirator EN14387 Type A (if above OEL) or as required", "when_required": "When ventilation is inadequate or above OEL", "icon": "respirator" }
  ],
  "required_equipment": ["List specific equipment/tools needed for this procedure"],
  "before_you_start": [
    "Specific pre-task checklist item 1",
    "Ensure adequate ventilation is in place",
    "Inspect PPE for damage before use",
    "Confirm SDS is accessible",
    "Check for incompatible materials nearby",
    "Ensure emergency eyewash/shower is accessible and functional"
  ],
  "procedure_steps": [
    { "step": 1, "action": "Detailed, specific action instruction in imperative form", "detail": "Additional detail or explanation for this step", "warning": "Specific warning for this step or null", "critical": false },
    { "step": 2, "action": "Next detailed step", "detail": "Additional detail", "warning": null, "critical": false },
    { "step": 3, "action": "Critical step that requires special attention", "detail": "Why this is critical and what to watch for", "warning": "⚠ CRITICAL: Specific critical warning text", "critical": true }
  ],
  "emergency_procedures": {
    "spill": "Detailed step-by-step spill response procedure specific to this chemical",
    "exposure_skin": "Detailed skin exposure response based on SDS Section 4",
    "exposure_eyes": "Detailed eye exposure response — specify flush duration and seek medical attention criteria",
    "inhalation": "Detailed inhalation response procedure",
    "ingestion": "Detailed ingestion response procedure",
    "fire": "Detailed fire response procedure with correct extinguishing agents for this chemical"
  },
  "prohibited_actions": [
    "Specific thing workers must NOT do with this chemical",
    "Do not eat, drink or smoke in areas where this chemical is used",
    "Do not mix with incompatible chemicals — list specific incompatibles"
  ],
  "storage_after_use": "Detailed post-use storage procedure — container sealing, labelling, location, temperature",
  "waste_disposal": "Detailed waste disposal procedure — container, labelling, approved disposal method, regulatory references",
  "emergency_contacts": {
    "site_emergency": "[Site emergency number]",
    "poison_control": "${isArabic ? 'مركز السموم: [رقم]' : 'Poison Control Center: 1-800-222-1222 (US)'}",
    "chemtrec": "CHEMTREC: +1-800-424-9300 (24h International)",
    "emergency_services": "${isArabic ? 'الطوارئ: 911' : 'Emergency Services: 911 (US) / 999 (UK) / 112 (EU)'}"
  },
  "regulatory_references": [
    "OSHA 29 CFR 1910.1200 (HazCom Standard)",
    "GHS/SDS reference for this chemical",
    "Local regulatory requirements"
  ],
  "training_requirements": "Describe required training before worker can perform this procedure independently",
  "review_history": [
    { "version": "1.0", "date": "${new Date().toISOString().split('T')[0]}", "description": "Initial issue — generated by SafeSheet AI", "author": "SafeSheet AI" }
  ]
}

CRITICAL: 
- Make ALL procedure_steps SPECIFIC to ${sdsData.chemical_name} and the ${type} procedure
- Include at least 8-12 detailed procedure steps
- Make emergency procedures reference the actual SDS data provided above
- All content must be in ${languageName}
- Return ONLY raw JSON`;

  const response = await openai.chat.completions.create({
    model: env.ai.openaiModel,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    max_tokens: 5000,
    response_format: { type: 'json_object' },
  });

  let sopData;
  try {
    sopData = JSON.parse(response.choices[0].message.content);
  } catch (e) {
    throw new Error('SOP generation failed — invalid AI response. Please retry.');
  }

  return { ...sopData, sds_id: sdsId, ai_model: 'gpt-4o', tokens_used: response.usage?.total_tokens || 0, generated_at: new Date().toISOString() };
};

module.exports = { generateSop };