'use strict';
const OpenAI = require('openai');
const env = require('../../config/env');
const { calculateAcuteToxicityMix, applyConcentrationCutoffs } = require('../compliance/mixtureCalculationService');
const client = new OpenAI({ apiKey: env.ai.openaiKey });

const autoFillFromCas = async (casNumber) => {
  const resp=await client.chat.completions.create({model:env.ai.openaiModel,messages:[{role:'user',content:`For CAS ${casNumber}, provide GHS hazard properties needed for mixture classification. Return JSON:{"chemical_name":"","iupac_name":"","formula":"","molecular_weight":"","cas_number":"${casNumber}","physical_state":"","flash_point":null,"boiling_point":null,"ate_oral":null,"ate_dermal":null,"aquatic_lc50":null,"is_flammable":false,"is_carcinogen_cat1":false,"is_carcinogen_cat2":false,"is_reproductive_tox":false,"is_skin_sensitiser":false,"is_skin_corrosive":false,"ghs_classifications":[],"h_codes":[],"osha_pel":null,"acgih_tlv":null,"data_confidence":75}`}],temperature:0.1,max_tokens:600,response_format:{type:'json_object'}});
  return JSON.parse(resp.choices[0].message.content);
};

const simulateConcentrationChange = async (components, newConcentrations) => {
  const updated=components.map((c,i)=>({...c,concentration_percent:newConcentrations[i]??c.concentration_percent}));
  const total=updated.reduce((s,c)=>s+(parseFloat(c.concentration_percent)||0),0);
  const acuteTox=calculateAcuteToxicityMix(updated);
  const cutoffs=applyConcentrationCutoffs(updated);
  const flam=updated.filter(c=>c.is_flammable&&parseFloat(c.concentration_percent)>0);
  const minFp=flam.length>0?Math.min(...flam.filter(c=>c.flash_point).map(c=>parseFloat(c.flash_point)||999)):null;
  let flamClass=null;
  if(minFp!==null&&minFp<999){if(minFp<23)flamClass={category:'Flammable Liquid Cat 2',signal:'DANGER',h_code:'H225'};else if(minFp<60)flamClass={category:'Flammable Liquid Cat 3',signal:'WARNING',h_code:'H226'};}
  const allH=[...cutoffs];
  if(acuteTox.oral_category)allH.push({hazard:acuteTox.oral_category.label,h_code:acuteTox.oral_category.h_code});
  if(flamClass)allH.push({hazard:flamClass.category,h_code:flamClass.h_code});
  const sigs=allH.map(h=>h.h_code?.match(/H[23]0[0-3]|H2[24-5]|H314/)?'DANGER':'WARNING');
  const signal=sigs.includes('DANGER')?'DANGER':sigs.length>0?'WARNING':'Not classified';
  return {components:updated,total_concentration:total,concentration_valid:Math.abs(total-100)<0.5,hazards:allH,overall_signal_word:signal,acute_toxicity:acuteTox,flammability:flamClass,calculated_at:new Date().toISOString()};
};

const optimizeFormulation = async (components, goal, jurisdiction='US_OSHA') => {
  const GOALS={reduce_toxicity:'Reduce acute toxicity',reduce_flammability:'Reduce flammability hazard',remove_carcinogen:'Remove carcinogenic substances',reduce_hazard:'Reduce overall GHS hazard classification',make_compliant:'Achieve full regulatory compliance'};
  const resp=await client.chat.completions.create({model:env.ai.openaiModel,messages:[{role:'user',content:`Optimize mixture to: ${GOALS[goal]||goal}. Jurisdiction:${jurisdiction}. Components:${JSON.stringify(components.map(c=>({name:c.chemical_name,cas:c.cas_number,conc:c.concentration_percent+'%',role:c.role,flammable:c.is_flammable,carcinogen:c.is_carcinogen_cat1||c.is_carcinogen_cat2})))}\nProvide 2-3 strategies. Return JSON:{"goal":"${goal}","current_risk_summary":"","strategies":[{"strategy_name":"","description":"","changes":[{"action":"replace|reduce|remove","component":"","current_conc":"","new_conc":"","replacement":null,"reason":""}],"expected_outcome":"","feasibility":"high|medium|low","trade_offs":""}],"recommendation":""}`}],temperature:0.3,max_tokens:1500,response_format:{type:'json_object'}});
  return JSON.parse(resp.choices[0].message.content);
};

const explainClassification = async (classification, context) => {
  const resp=await client.chat.completions.create({model:env.ai.openaiModel,messages:[{role:'user',content:`Explain GHS classification: ${JSON.stringify(classification)}. Context:${JSON.stringify(context).slice(0,1000)}. Return JSON:{"plain_english":"","technical_basis":"","data_used":"","ghs_reference":"","confidence":"high|medium|low","uncertainties":""}`}],temperature:0.1,max_tokens:500,response_format:{type:'json_object'}});
  return JSON.parse(resp.choices[0].message.content);
};

module.exports = { autoFillFromCas, simulateConcentrationChange, optimizeFormulation, explainClassification };
