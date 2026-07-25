import api from '@/lib/api';
const s={upload:(file:File,opts:{jurisdiction?:string;language?:string;autoGenerateSop?:boolean})=>{const f=new FormData();f.append('file',file);f.append('jurisdiction',opts.jurisdiction||'US_OSHA');f.append('language',opts.language||'en');f.append('autoGenerateSop',String(opts.autoGenerateSop||false));return api.post('/pipeline/upload',f,{headers:{'Content-Type':'multipart/form-data'}});},generate:(d:unknown)=>api.post('/pipeline/generate',d)};
export default s;
