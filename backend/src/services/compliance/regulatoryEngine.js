'use strict';
const OpenAI = require('openai');
const env = require('../../config/env');
const client = new OpenAI({ apiKey: env.ai.openaiKey });

const H_STATEMENTS = {H200:'Unstable explosive',H220:'Extremely flammable gas',H224:'Extremely flammable liquid and vapour',H225:'Highly flammable liquid and vapour',H226:'Flammable liquid and vapour',H228:'Flammable solid',H270:'May cause or intensify fire; oxidiser',H290:'May be corrosive to metals',H300:'Fatal if swallowed',H301:'Toxic if swallowed',H302:'Harmful if swallowed',H304:'May be fatal if swallowed and enters airways',H310:'Fatal in contact with skin',H311:'Toxic in contact with skin',H312:'Harmful in contact with skin',H314:'Causes severe skin burns and eye damage',H315:'Causes skin irritation',H317:'May cause an allergic skin reaction',H318:'Causes serious eye damage',H319:'Causes serious eye irritation',H330:'Fatal if inhaled',H331:'Toxic if inhaled',H332:'Harmful if inhaled',H334:'May cause allergy or asthma if inhaled',H335:'May cause respiratory irritation',H336:'May cause drowsiness or dizziness',H340:'May cause genetic defects',H341:'Suspected of causing genetic defects',H350:'May cause cancer',H351:'Suspected of causing cancer',H360:'May damage fertility or the unborn child',H370:'Causes damage to organs',H372:'Causes damage to organs through prolonged exposure',H400:'Very toxic to aquatic life',H410:'Very toxic to aquatic life with long lasting effects',H411:'Toxic to aquatic life with long lasting effects',H412:'Harmful to aquatic life with long lasting effects'};
const PICTOGRAM_NAMES = {GHS01:'Exploding Bomb',GHS02:'Flame',GHS03:'Flame Over Circle',GHS04:'Gas Cylinder',GHS05:'Corrosion',GHS06:'Skull and Crossbones',GHS07:'Exclamation Mark',GHS08:'Health Hazard',GHS09:'Environmental Hazard'};
const JURISDICTION_FRAMEWORKS = {US_OSHA:{name:'OSHA HazCom 2012',standard:'29 CFR 1910.1200',ghs_revision:'Rev 3',oelSource:'OSHA PEL / ACGIH TLV'},EU_CLP:{name:'EU CLP/REACH',standard:'EC 1272/2008',ghs_revision:'Rev 7',oelSource:'EU OEL Directive'},UK_HSE:{name:'UK GB CLP',standard:'REACH UK',ghs_revision:'Rev 7',oelSource:'EH40 WELs'},AU_WHS:{name:'AU WHS',standard:'WHS Regs 2011',ghs_revision:'Rev 3',oelSource:'Safe Work Australia'},CA_WHMIS:{name:'WHMIS 2015',standard:'HPA 2015',ghs_revision:'Rev 5',oelSource:'Provincial OELs'},SA_SASO:{name:'GCC SASO',standard:'GSO-1651',ghs_revision:'Rev 7',oelSource:'Saudi MOL',requiresArabic:true},CN_GB:{name:'China GB',standard:'GB/T 16483',ghs_revision:'Rev 4',oelSource:'GBZ 2.1 OELs'}};

const classifyHazards = async (chemicalData) => {
  const {chemicalName,casNumber,formula,physicalProperties={},toxicologyData={}} = chemicalData;
  const resp = await client.chat.completions.create({model:env.ai.openaiModel,messages:[{role:'user',content:`GHS Rev 7 classify: ${chemicalName||'Unknown'} CAS:${casNumber||'N/A'} Formula:${formula||'N/A'} Physical:${JSON.stringify(physicalProperties)} Tox:${JSON.stringify(toxicologyData)}\nReturn JSON:{"classifications":[{"hazard_class":"","category":"","criteria_met":"","regulation_reference":""}],"signal_word":"DANGER","h_statements":["H225"],"p_statements":["P210"],"pictograms":["GHS02"],"classification_notes":"","confidence":85,"data_gaps":[]}`}],temperature:0.1,max_tokens:1500,response_format:{type:'json_object'}});
  const result=JSON.parse(resp.choices[0].message.content);
  result.h_statements_full=(result.h_statements||[]).map(c=>({code:c,text:H_STATEMENTS[c]||c}));
  result.pictograms_full=(result.pictograms||[]).map(c=>({code:c,name:PICTOGRAM_NAMES[c]||c}));
  return result;
};

const validateCompliance = async (sdsDoc, jurisdiction='US_OSHA') => {
  const fw=JURISDICTION_FRAMEWORKS[jurisdiction]||JURISDICTION_FRAMEWORKS.US_OSHA;
  const secs=sdsDoc.sections||{};
  const required={section1:['product_identifier','supplier_name','emergency_phone'],section2:['ghs_classification','signal_word','hazard_statements','pictograms'],section3:['substance_or_mixture','chemical_name','cas_number'],section4:['inhalation','skin_contact','eye_contact','ingestion'],section5:['suitable_extinguishing_media','specific_hazards'],section6:['personal_precautions','cleanup_methods'],section7:['handling_precautions','storage_conditions'],section8:['exposure_limits','respiratory_protection','hand_protection','eye_protection'],section9:['physical_state','flash_point','boiling_point'],section10:['chemical_stability','incompatible_materials','hazardous_decomposition_products'],section11:['routes_of_exposure','acute_toxicity_oral'],section12:['aquatic_toxicity_fish','persistence_degradability'],section13:['waste_treatment_methods'],section14:['un_number','proper_shipping_name','hazard_class','packing_group'],section15:['eu_reach_clp','us_tsca'],section16:['preparation_date','disclaimer']};
  const gaps=[];const sectionChecks=[];let total=0,present=0;
  for(let i=1;i<=16;i++){
    const k=`section${i}`;const sec=secs[k];const content=sec?.content||sec||{};const reqs=required[k]||[];let sP=0;
    if(!sec)gaps.push({section:k,severity:'critical',field:'entire_section',issue:`Section ${i} missing`,regulation:fw.standard});
    for(const f of reqs){total++;const v=content[f];const empty=!v||(Array.isArray(v)&&v.length===0)||String(v).trim()===''||String(v).includes('...')||String(v).toLowerCase().includes('[data required]');if(!empty){present++;sP++;}else gaps.push({section:k,severity:i<=3||k==='section8'?'critical':'major',field:f,issue:`${f.replace(/_/g,' ')} missing in Section ${i}`,regulation:`${fw.standard} §${i}`});}
    sectionChecks.push({section:k,title:sec?.title||`Section ${i}`,score:reqs.length?Math.round(sP/reqs.length*100):100,present:sP,total:reqs.length,complete:sP===reqs.length});
  }
  if(jurisdiction==='SA_SASO'&&sdsDoc.language!=='ar')gaps.push({section:'general',severity:'critical',field:'language',issue:'Saudi SASO requires Arabic',regulation:'SASO GSO-1651'});
  const comp=total>0?Math.round(present/total*100):0;const crit=gaps.filter(g=>g.severity==='critical').length;const score=Math.max(0,Math.min(100,comp-crit*5));
  return {jurisdiction,framework:fw.name,standard:fw.standard,score,completeness_percent:comp,status:score>=90?'compliant':score>=60?'needs_update':'non_compliant',status_label:score>=90?'Compliant ✅':score>=60?'Needs Update ⚠️':'Non-Compliant ❌',section_checks:sectionChecks,gaps:gaps.slice(0,25),critical_count:crit,major_count:gaps.filter(g=>g.severity==='major').length,validated_at:new Date().toISOString()};
};

const detectConflicts = (sdsDoc) => {
  const secs=sdsDoc.sections||{};const s2=secs.section2?.content||{};const s9=secs.section9?.content||{};const s8=secs.section8?.content||{};
  const classes=(s2.ghs_classification||[]).join(' ').toLowerCase();const hs=(s2.hazard_statements||[]).join(' ').toLowerCase();const conflicts=[];
  if((classes.includes('flammable')||hs.includes('h22'))&&!s9.flash_point)conflicts.push({type:'missing_data',severity:'critical',description:'Flammable classification but no flash point in Section 9',sections:['section2','section9'],fix:'Add flash point to Section 9'});
  if((hs.includes('h30')||hs.includes('h31'))&&!s8.exposure_limits)conflicts.push({type:'missing_data',severity:'critical',description:'Toxic classification but no exposure limits in Section 8',sections:['section2','section8'],fix:'Add OELs to Section 8'});
  if((hs.includes('h314')||hs.includes('h318'))&&!s8.eye_protection)conflicts.push({type:'missing_data',severity:'major',description:'Corrosive but no eye protection in Section 8',sections:['section2','section8'],fix:'Add eye protection to Section 8'});
  if((s2.hazard_statements||[]).length>0&&!(s2.precautionary_statements?.prevention?.length))conflicts.push({type:'incomplete',severity:'major',description:'H-statements present but P-statements missing',sections:['section2'],fix:'Add P-statements'});
  return conflicts;
};

module.exports = {classifyHazards,validateCompliance,detectConflicts,H_STATEMENTS,PICTOGRAM_NAMES,JURISDICTION_FRAMEWORKS};
