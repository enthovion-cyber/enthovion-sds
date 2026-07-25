'use strict';
const OpenAI = require('openai');
const pdfParse = require('pdf-parse');
const env = require('../../config/env');
const client = new OpenAI({ apiKey: env.ai.openaiKey });

const processDocument = async (fileBuffer, fileName, options = {}) => {
  const { jurisdiction = 'US_OSHA' } = options;
  let rawText = '';
  try { const pdf = await pdfParse(fileBuffer); rawText = pdf.text; } catch (e) { throw new Error(`PDF parse failed: ${e.message}`); }
  if (!rawText || rawText.trim().length < 50) throw new Error('No extractable text in PDF.');
  const truncated = rawText.length > 14000 ? rawText.slice(0, 14000) + '\n[TRUNCATED]' : rawText;
  const prompt = `Extract SDS into structured JSON. Source: ${fileName}\nText:\n${truncated}\nReturn JSON with chemical_name,cas_number,formula,detected_language,extraction_confidence(0-100),sections(section1-section16 each with title,content,confidence).`;
  const resp = await client.chat.completions.create({ model: env.ai.openaiModel, messages:[{role:'user',content:prompt}], temperature:0.05, max_tokens:6000, response_format:{type:'json_object'} });
  const extracted = JSON.parse(resp.choices[0].message.content);
  const confidence = extracted.extraction_confidence || 70;
  const lowFields = [];
  for (let i=1;i<=16;i++) { const s=extracted.sections?.[`section${i}`]; if(s && s.confidence < 60) lowFields.push({section:`section${i}`,confidence:s.confidence,reason:'Low confidence extraction'}); }
  return { ...extracted, language: extracted.detected_language||'en', jurisdiction, source_file: fileName, extraction_confidence: confidence,
    intelligence: { entity_graph:buildEntities(extracted), hazard_links:buildHazardLinks(extracted), regulation_map:{jurisdiction,standard:jurisdiction==='US_OSHA'?'29 CFR 1910.1200':'EC 1272/2008'}, data_completeness:confidence, fields_requiring_review:lowFields, intelligence_version:'2.0', processed_at:new Date().toISOString() },
    extracted_at: new Date().toISOString(), tokens_used: resp.usage?.total_tokens||0 };
};

const buildEntities = (d) => {
  const entities=[]; const n=d.chemical_name; const c=d.cas_number;
  if(n) entities.push({type:'primary_substance',name:n,cas:c,formula:d.formula});
  const ings=(d.sections?.section3?.content?.ingredients)||[];
  for(const i of (Array.isArray(ings)?ings:[])) if(i.component||i.name) entities.push({type:'ingredient',name:i.component||i.name,cas:i.cas,concentration:i.concentration});
  return {entities,entity_count:entities.length,has_mixture:entities.length>1};
};

const buildHazardLinks = (d) => {
  const s2=d.sections?.section2?.content||{};const s9=d.sections?.section9?.content||{};const s11=d.sections?.section11?.content||{};
  const links=[]; const hs=s2.hazard_statements||[];
  for(const h of (Array.isArray(hs)?hs:[])){
    const code=typeof h==='string'?h.split(':')[0].trim():h;
    if(/H22[4-6]/.test(code)) links.push({h_code:code,category:'Flammable',evidence_field:'flash_point',value:s9.flash_point||'Not stated'});
    else if(/H30[0-4]/.test(code)) links.push({h_code:code,category:'Acute Toxicity',evidence_field:'acute_toxicity_oral',value:s11.acute_toxicity_oral||'Not stated'});
    else if(/H314/.test(code)) links.push({h_code:code,category:'Skin Corrosion',evidence_field:'skin_corrosion_irritation',value:s11.skin_corrosion_irritation||'Not stated'});
  }
  return {hazard_links:links};
};

module.exports = { processDocument };
