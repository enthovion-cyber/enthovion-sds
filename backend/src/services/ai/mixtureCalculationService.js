/**
 * Mixture Hazard Calculation Service
 * Implements GHS bridging principles for mixture classification
 * Uses additivity formula for acute toxicity
 */
const { openai } = require('../ai/openaiService');
const env = require('../../config/env');
const pubchemService = require('../regulatory/pubchemService');

const clampPercent = (value) => Math.max(0, Math.min(100, Number(value) || 0));

/**
 * GHS Acute Toxicity Additivity Formula
 * 1/ATE_mix = Σ(Ci / ATE_i)  where C = concentration fraction
 */
const calculateAcuteToxicityMix = (components) => {
  let sum = 0;
  const details = [];

  for (const comp of components) {
    const fraction = (comp.concentration_percent || 0) / 100;
    const ate = comp.ate_oral || comp.ld50_oral;

    if (ate && ate > 0 && fraction > 0) {
      sum += fraction / ate;
      details.push({ component: comp.chemical_name, concentration: fraction * 100, ate_used: ate, contribution: (fraction / ate).toFixed(6) });
    } else if (fraction > 0) {
      // Unknown ATE — use conservative default per GHS
      const defaultAte = 100; // Assumed Cat 1 if unknown
      sum += fraction / defaultAte;
      details.push({ component: comp.chemical_name, concentration: fraction * 100, ate_used: defaultAte, note: 'ATE unknown — conservative default used' });
    }
  }

  const ate_mix = sum > 0 ? (1 / sum).toFixed(2) : null;

  let oral_category = null;
  if (ate_mix) {
    const ateMixNum = parseFloat(ate_mix);
    if (ateMixNum <= 5)    oral_category = { cat: 1, label: 'Acute Tox. 1', signal: 'DANGER',  h_code: 'H300' };
    else if (ateMixNum <= 50)  oral_category = { cat: 2, label: 'Acute Tox. 2', signal: 'DANGER',  h_code: 'H300' };
    else if (ateMixNum <= 300) oral_category = { cat: 3, label: 'Acute Tox. 3', signal: 'DANGER',  h_code: 'H301' };
    else if (ateMixNum <= 2000) oral_category = { cat: 4, label: 'Acute Tox. 4', signal: 'WARNING', h_code: 'H302' };
    else if (ateMixNum <= 5000) oral_category = { cat: 5, label: 'Acute Tox. 5', signal: 'WARNING', h_code: 'H303' };
  }

  return { ate_mix, oral_category, calculation_details: details };
};

/**
 * Checks concentration thresholds for classification cut-offs
 */
const applyConcentrationCutoffs = (components) => {
  const hazards = [];

  for (const comp of components) {
    const conc = parseFloat(comp.concentration_percent) || 0;
    const maxConc = parseFloat(comp.concentration_max) || conc;
    const useConc = maxConc;

    // GHS cut-off values (Table 3.6.3)
    if (comp.is_carcinogen_cat1 && useConc >= 0.1)  hazards.push({ source: comp.chemical_name, hazard: 'Carcinogenicity Cat 1', h_code: 'H350', basis: `${useConc}% ≥ 0.1% cut-off` });
    if (comp.is_carcinogen_cat2 && useConc >= 1.0)  hazards.push({ source: comp.chemical_name, hazard: 'Carcinogenicity Cat 2', h_code: 'H351', basis: `${useConc}% ≥ 1.0% cut-off` });
    if (comp.is_reproductive_tox && useConc >= 0.3) hazards.push({ source: comp.chemical_name, hazard: 'Reproductive Toxicity Cat 1/2', h_code: 'H360', basis: `${useConc}% ≥ 0.3% cut-off` });
    if (comp.is_skin_sensitiser && useConc >= 0.1)  hazards.push({ source: comp.chemical_name, hazard: 'Skin Sensitisation Cat 1', h_code: 'H317', basis: `${useConc}% ≥ 0.1% cut-off` });
    if (comp.is_skin_corrosive && useConc >= 5.0)   hazards.push({ source: comp.chemical_name, hazard: 'Skin Corrosion Cat 1', h_code: 'H314', basis: `${useConc}% ≥ 5% cut-off` });
    if (comp.is_skin_corrosive && useConc >= 1.0 && useConc < 5.0) hazards.push({ source: comp.chemical_name, hazard: 'Skin Irritation Cat 2', h_code: 'H315', basis: `${useConc}% ≥ 1% cut-off` });
  }

  return hazards;
};

/**
 * Full mixture hazard calculation with AI enrichment
 */
const calculateMixtureHazards = async (mixtureData) => {
  const { name, components = [], jurisdiction = 'US_OSHA' } = mixtureData;

  // Enrich components with PubChem data
  const enrichedComponents = await Promise.all(components.map(async (comp) => {
    if (comp.cas_number) {
      try {
        const pubchem = await pubchemService.getCompoundData(comp.cas_number);
        return { ...comp, pubchem_data: pubchem.summary };
      } catch { return comp; }
    }
    return comp;
  }));

  // Run GHS calculations
  const acuteToxResult  = calculateAcuteToxicityMix(enrichedComponents);
  const cutoffHazards   = applyConcentrationCutoffs(enrichedComponents);

  // AI classification for complex hazards
  const prompt = `You are a GHS mixture classification expert. Based on the component data, classify this mixture.

Mixture name: ${name}
Components: ${JSON.stringify(enrichedComponents.map(c => ({ name: c.chemical_name, cas: c.cas_number, concentration: c.concentration_percent + '%', role: c.role })), null, 2)}
Acute toxicity calculation result: ${JSON.stringify(acuteToxResult)}
Concentration cut-off hazards identified: ${JSON.stringify(cutoffHazards)}

Apply GHS Rev 7 mixture classification criteria including:
- Flammability (based on flash point of flammable components and their concentration)  
- Aquatic toxicity (summation method per GHS Table 4.1.3)
- Physical hazards from dominant components
- Any bridging principles applicable (dilution, concentration, interpolation)

Return JSON:
{
  "overall_classifications": [{ "hazard_class": "...", "category": "...", "basis": "...", "h_code": "..." }],
  "signal_word": "DANGER or WARNING",
  "all_h_codes": ["H225", "H302"],
  "all_p_codes": ["P210", "P233", "P280"],
  "pictograms": ["GHS02", "GHS07"],
  "mixture_notes": "Key classification decisions and bridging principles applied",
  "requires_experimental_data": ["List any properties requiring experimental testing"],
  "confidence_score": 78
}
Return ONLY JSON.`;

  const response = await openai.chat.completions.create({
    model: env.ai.openaiModel,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  const aiClassification = JSON.parse(response.choices[0].message.content);

  return {
    mixture_name: name,
    jurisdiction,
    components: enrichedComponents,
    acute_toxicity_calculation: acuteToxResult,
    concentration_cutoff_hazards: cutoffHazards,
    ai_classification: aiClassification,
    overall_signal_word: aiClassification.signal_word || 'WARNING',
    all_h_codes: aiClassification.all_h_codes || [],
    all_p_codes: aiClassification.all_p_codes || [],
    pictograms: aiClassification.pictograms || [],
    confidence_score: aiClassification.confidence_score || 70,
    calculated_at: new Date().toISOString(),
  };
};

const autoFillComponent = async ({ cas_number, chemical_name }) => {
  const lookup = cas_number || chemical_name;
  if (!lookup) return null;

  const pubchem = await pubchemService.getCompoundData(lookup);
  const summary = pubchem?.summary || {};
  const hazardText = JSON.stringify(summary.ghsHazards || []).toLowerCase();

  return {
    chemical_name: chemical_name || summary.iupacName || lookup,
    cas_number: cas_number || null,
    role: 'active',
    pubchem_data: summary,
    inferred_flags: {
      is_skin_sensitiser: hazardText.includes('sensit'),
      is_carcinogen_cat1: hazardText.includes('carcin'),
      is_carcinogen_cat2: false,
      is_reproductive_tox: hazardText.includes('repro'),
      is_skin_corrosive: hazardText.includes('corros'),
    },
  };
};

const runWhatIfSimulation = async ({ mixture, componentId, concentrationPercent }) => {
  const simulated = {
    ...mixture,
    components: (mixture.components || []).map((comp, idx) => {
      const match = comp.id === componentId || String(idx) === String(componentId);
      if (!match) return comp;
      return {
        ...comp,
        concentration_percent: clampPercent(concentrationPercent),
      };
    }),
  };

  const result = await calculateMixtureHazards({
    name: simulated.name,
    components: simulated.components || [],
    jurisdiction: simulated.jurisdiction || 'US_OSHA',
  });

  return {
    simulation_input: { componentId, concentrationPercent: clampPercent(concentrationPercent) },
    updated_hazards: result,
  };
};

const optimizeMixture = async ({ mixture, goal = 'Reduce hazard' }) => {
  const sorted = [...(mixture.components || [])].sort(
    (a, b) => (Number(b.concentration_percent) || 0) - (Number(a.concentration_percent) || 0)
  );
  const top = sorted[0];
  const suggestions = [];

  if (top) {
    suggestions.push({
      type: 'adjust_percentage',
      component: top.chemical_name,
      current_percent: Number(top.concentration_percent) || 0,
      suggested_percent: Math.max(0, (Number(top.concentration_percent) || 0) - 10),
      rationale: `Reduce dominant component loading to pursue goal: ${goal}.`,
    });
  }

  suggestions.push({
    type: 'replace_component',
    component: top?.chemical_name || 'Primary hazardous component',
    alternative: 'Lower-toxicity substitute (screen with regulatory filters)',
    rationale: 'Substitution is often the fastest path to lower risk categories.',
  });

  return {
    goal,
    optimization_suggestions: suggestions,
    explainability: {
      applied_rule: 'GHS additivity and concentration cut-off prioritization',
      why: 'Dominant concentration components drive mixture classification outcomes.',
    },
  };
};

module.exports = {
  calculateMixtureHazards,
  calculateAcuteToxicityMix,
  applyConcentrationCutoffs,
  autoFillComponent,
  runWhatIfSimulation,
  optimizeMixture,
};