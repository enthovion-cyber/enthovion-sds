const axios = require('axios');

const BASE_URL = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';

/**
 * Fetches compound data from PubChem by CAS number or name
 */
const getCompoundData = async (casOrName) => {
  try {
    // Try CAS first, then name
    const type = /^\d{1,7}-\d{2}-\d$/.test(casOrName) ? 'name' : 'name';
    const encName = encodeURIComponent(casOrName);

    const [propertiesRes, hazardRes] = await Promise.allSettled([
      axios.get(`${BASE_URL}/compound/${type}/${encName}/property/MolecularFormula,MolecularWeight,IUPACName,InChIKey,XLogP,ExactMass/JSON`, { timeout: 8000 }),
      axios.get(`${BASE_URL}/compound/${type}/${encName}/GHS/JSON`, { timeout: 8000 }),
    ]);

    const summary = {};

    if (propertiesRes.status === 'fulfilled' && propertiesRes.value.data?.PropertyTable?.Properties?.[0]) {
      const props = propertiesRes.value.data.PropertyTable.Properties[0];
      summary.cid = props.CID;
      summary.molecularFormula = props.MolecularFormula;
      summary.molecularWeight = props.MolecularWeight;
      summary.iupacName = props.IUPACName;
      summary.inchiKey = props.InChIKey;
    }

    if (hazardRes.status === 'fulfilled' && hazardRes.value.data?.Hierarchies?.Hierarchy) {
      const ghs = hazardRes.value.data.Hierarchies.Hierarchy;
      summary.ghsHazards = ghs.slice(0, 5).map((h) => h?.Information?.[0]?.Value?.StringWithMarkup?.[0]?.String).filter(Boolean);
    }

    return { summary, source: 'PubChem', retrieved_at: new Date().toISOString() };
  } catch (err) {
    console.warn(`[PubChem] Lookup failed for "${casOrName}": ${err.message}`);
    return { summary: null, source: 'PubChem', error: err.message };
  }
};

/**
 * Gets CID (PubChem Compound ID) for a CAS number
 */
const getCid = async (casNumber) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/compound/name/${encodeURIComponent(casNumber)}/cids/JSON`,
      { timeout: 5000 }
    );
    return res.data?.IdentifierList?.CID?.[0] || null;
  } catch {
    return null;
  }
};

module.exports = { getCompoundData, getCid };
