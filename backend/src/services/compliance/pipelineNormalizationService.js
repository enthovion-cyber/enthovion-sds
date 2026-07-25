const UNIT_CONVERSIONS = {
  c_to_f: (c) => (Number(c) * 9) / 5 + 32,
  ppm_to_mg_m3: (ppm, mw = 24.45) => (Number(ppm) * Number(mw)) / 24.45,
};

const safeNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const normalizeTemperatureField = (value) => {
  if (value === undefined || value === null || value === "") return value;
  const str = String(value).trim();
  const n = safeNumber(str.replace(/[^\d.-]/g, ""));
  if (n === null) return value;
  return {
    value_c: Number(n.toFixed(2)),
    value_f: Number(UNIT_CONVERSIONS.c_to_f(n).toFixed(2)),
    unit: "C",
    original: str,
  };
};

const normalizeExposureLimits = (limits = []) => {
  if (!Array.isArray(limits)) return limits;
  return limits.map((limit) => {
    const next = { ...limit };
    if (limit.osha_pel_ppm !== undefined) {
      const ppm = safeNumber(limit.osha_pel_ppm);
      if (ppm !== null) {
        next.osha_pel_ppm = ppm;
        if (limit.molecular_weight) {
          next.osha_pel_mg_m3 = Number(
            UNIT_CONVERSIONS.ppm_to_mg_m3(ppm, limit.molecular_weight).toFixed(2)
          );
        }
      }
    }
    return next;
  });
};

const normalizeSdsDocument = (doc = {}) => {
  const sections = { ...(doc.sections || {}) };
  const section8 = sections.section8?.content || {};
  const section9 = sections.section9?.content || {};

  const normalizedSection9 = {
    ...section9,
    flash_point: normalizeTemperatureField(section9.flash_point),
    boiling_point: normalizeTemperatureField(section9.boiling_point),
    melting_point: normalizeTemperatureField(section9.melting_point),
    auto_ignition_temperature: normalizeTemperatureField(section9.auto_ignition_temperature),
  };

  const normalizedSection8 = {
    ...section8,
    exposure_limits: normalizeExposureLimits(section8.exposure_limits || []),
  };

  if (sections.section8) {
    sections.section8 = {
      ...(sections.section8 || {}),
      content: normalizedSection8,
    };
  }
  if (sections.section9) {
    sections.section9 = {
      ...(sections.section9 || {}),
      content: normalizedSection9,
    };
  }

  return {
    ...doc,
    sections,
    normalization_meta: {
      unit_system: "metric_primary",
      normalized_at: new Date().toISOString(),
      transformed_fields: [
        "section9.flash_point",
        "section9.boiling_point",
        "section9.melting_point",
        "section9.auto_ignition_temperature",
        "section8.exposure_limits",
      ],
    },
  };
};

module.exports = {
  normalizeSdsDocument,
};

