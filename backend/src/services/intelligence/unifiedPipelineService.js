'use strict';
const { processDocument } = require('./sdsIntelligenceService');
const { generateSds } = require('../ai/sdsGeneratorService');
const { generateSop } = require('../ai/sopGeneratorService');
const { generateLabelHtml, extractLabelData } = require('../labels/labelGeneratorService');
const { validateCompliance } = require('../compliance/regulatoryEngine');
const { scoreDocument } = require('../validation/aiValidationService');
const sdsModel = require('../../models/sdsModel');
const sdsVersionModel = require('../../models/sdsVersionModel');
const labelsModel = require('../../models/labelsModel');
const validationModel = require('../../models/validationModel');
const complianceModel = require('../../models/complianceModel');

const runUploadPipeline = async ({ fileBuffer, fileName, userId, jurisdiction='US_OSHA', language='en', autoGenerateSop=false }) => {
  const steps=[];const t0=Date.now();
  steps.push({step:1,name:'Intelligence extraction',status:'running'});
  const extracted=await processDocument(fileBuffer,fileName,{jurisdiction});
  steps[0].status='done';steps[0].result=`Extracted ${Object.keys(extracted.sections||{}).length} sections, confidence ${extracted.extraction_confidence}%`;

  steps.push({step:2,name:'Saving to library',status:'running'});
  const saved=await sdsModel.create({user_id:userId,chemical_name:extracted.chemical_name||'Unknown',cas_number:extracted.cas_number,formula:extracted.formula,language:extracted.language||language,jurisdiction,sections:extracted.sections,status:'draft',source_file:fileName,extraction_confidence:extracted.extraction_confidence,expires_at:new Date(Date.now()+3*365*24*60*60*1000).toISOString()});
  await sdsVersionModel.create({sds_id:saved.id,version:1,sections:extracted.sections,changed_by:userId,change_summary:'Imported via intelligence pipeline'});
  steps[1].status='done';steps[1].result=`Saved ID: ${saved.id}`;

  steps.push({step:3,name:'Validation',status:'running'});
  const validation=scoreDocument(saved);
  await validationModel.create({sds_id:saved.id,user_id:userId,overall_score:validation.overall_score,status:validation.status,missing_items:validation.missing_items,conflicts:validation.conflicts,section_scores:validation.section_scores,validated_at:validation.validated_at});
  steps[2].status='done';steps[2].result=`Score: ${validation.overall_score}/100`;

  steps.push({step:4,name:'Compliance audit',status:'running'});
  const compliance=await validateCompliance(saved,jurisdiction);
  await complianceModel.create({sds_id:saved.id,jurisdiction,score:compliance.score,gaps:compliance.gaps,run_by:userId});
  await sdsModel.update(saved.id,{compliance_score:compliance.score});
  steps[3].status='done';steps[3].result=`Compliance: ${compliance.score}/100`;

  steps.push({step:5,name:'Generating GHS label',status:'running'});
  const labelData=extractLabelData(saved);
  const savedLabel=await labelsModel.create({sds_id:saved.id,user_id:userId,size:'medium',language,label_data:labelData});
  steps[4].status='done';steps[4].result=`Label ID: ${savedLabel.id}`;

  let savedSop=null;
  if(autoGenerateSop){
    steps.push({step:6,name:'Generating SOP',status:'running'});
    try{const sopContent=await generateSop({sdsData:saved,language,type:'handling',sdsId:saved.id});const sopModel=require('../../models/sopModel');savedSop=await sopModel.create({sds_id:saved.id,user_id:userId,language,type:'handling',title:sopContent.title,content:sopContent,is_rtl:sopContent.is_rtl||false,status:'draft',ai_model:'gpt-4o'});steps[5].status='done';}
    catch(e){steps[steps.length-1].status='skipped';steps[steps.length-1].result=e.message;}
  }

  return {pipeline:'upload',duration_ms:Date.now()-t0,steps,output:{sds:{id:saved.id,chemical_name:saved.chemical_name,status:saved.status,version:saved.version},intelligence:extracted.intelligence,validation:{score:validation.overall_score,status:validation.status_label,critical_count:validation.critical_count},compliance:{score:compliance.score,status:compliance.status_label,gap_count:compliance.gaps.length},label:{id:savedLabel.id},sop:savedSop?{id:savedSop.id}:null},fields_requiring_review:extracted.intelligence?.fields_requiring_review||[],next_actions:buildActions(validation,compliance)};
};

const runGeneratePipeline = async ({ chemicalInput, userId, jurisdiction='US_OSHA', language='en', generateLabel=true, generateSopFlag=true }) => {
  const steps=[];const t0=Date.now();
  steps.push({step:1,name:'AI SDS generation',status:'running'});
  const sdsData=await generateSds({...chemicalInput,jurisdiction,language});
  steps[0].status='done';steps[0].result=`Generated for ${sdsData.chemical_name}`;

  steps.push({step:2,name:'Saving SDS',status:'running'});
  const saved=await sdsModel.create({user_id:userId,chemical_name:sdsData.chemical_name,cas_number:sdsData.cas_number,formula:sdsData.formula,language,jurisdiction,sections:sdsData.sections,status:'draft',ai_model:'gpt-4o',tokens_used:sdsData.tokens_used,expires_at:new Date(Date.now()+3*365*24*60*60*1000).toISOString()});
  await sdsVersionModel.create({sds_id:saved.id,version:1,sections:sdsData.sections,changed_by:userId,change_summary:'Initial AI generation via pipeline'});
  steps[1].status='done';

  steps.push({step:3,name:'Validation',status:'running'});
  const validation=scoreDocument(saved);
  await validationModel.create({sds_id:saved.id,user_id:userId,overall_score:validation.overall_score,status:validation.status,missing_items:validation.missing_items,conflicts:validation.conflicts,section_scores:validation.section_scores,validated_at:validation.validated_at});
  steps[2].status='done';steps[2].result=`Score: ${validation.overall_score}/100`;

  steps.push({step:4,name:'Compliance audit',status:'running'});
  const compliance=await validateCompliance(saved,jurisdiction);
  await complianceModel.create({sds_id:saved.id,jurisdiction,score:compliance.score,gaps:compliance.gaps,run_by:userId});
  await sdsModel.update(saved.id,{compliance_score:compliance.score});
  steps[3].status='done';

  let savedLabel=null;
  if(generateLabel){steps.push({step:5,name:'GHS label',status:'running'});const labelData=extractLabelData(saved);savedLabel=await labelsModel.create({sds_id:saved.id,user_id:userId,size:'medium',language,label_data:labelData});steps[4].status='done';}

  let savedSop=null;
  if(generateSopFlag){steps.push({step:generateLabel?6:5,name:'Handling SOP',status:'running'});try{const sopContent=await generateSop({sdsData:saved,language,type:'handling',sdsId:saved.id});const sopModel=require('../../models/sopModel');savedSop=await sopModel.create({sds_id:saved.id,user_id:userId,language,type:'handling',title:sopContent.title,content:sopContent,is_rtl:sopContent.is_rtl||false,status:'draft',ai_model:'gpt-4o'});steps[steps.length-1].status='done';}catch(e){steps[steps.length-1].status='skipped';}}

  return {pipeline:'generate',duration_ms:Date.now()-t0,steps,output:{sds:{id:saved.id,chemical_name:saved.chemical_name,status:'draft',version:1},validation:{score:validation.overall_score,status:validation.status_label},compliance:{score:compliance.score,status:compliance.status_label},label:savedLabel?{id:savedLabel.id}:null,sop:savedSop?{id:savedSop.id}:null},next_actions:buildActions(validation,compliance)};
};

const buildActions=(v,c)=>{const a=[];if(v.critical_count>0)a.push({priority:1,action:'Fix critical validation issues',count:v.critical_count,link:'/validation'});if(c.score<60)a.push({priority:2,action:'Review compliance gaps',count:c.gaps?.length||0,link:'/compliance'});a.push({priority:3,action:'Approve SDS for publication',link:'/sds'});return a.sort((x,y)=>x.priority-y.priority);};

module.exports = { runUploadPipeline, runGeneratePipeline };
