import api from '@/lib/api';
const s={sendMessage:(d:unknown)=>api.post('/copilot/message',d),autoFix:(d:unknown)=>api.post('/copilot/auto-fix',d),getSummary:(id:string,lang?:string)=>api.get(`/copilot/summary/${id}`,{params:{language:lang}}),casAutoFill:(cas:string)=>api.get(`/copilot/cas/${cas}`),simulate:(d:unknown)=>api.post('/copilot/simulate',d),optimize:(d:unknown)=>api.post('/copilot/optimize',d),explain:(d:unknown)=>api.post('/copilot/explain',d)};
export default s;
