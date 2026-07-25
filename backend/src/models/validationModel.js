const { supabaseAdmin } = require('../config/database');
const TABLE = 'validation_results';

const create = async (data) => {
  const { data: result, error } = await supabaseAdmin.from(TABLE).insert(data).select().single();
  if (error) throw error;
  return result;
};

const findLatestBySdsId = async (sdsId) => {
  const { data, error } = await supabaseAdmin.from(TABLE).select('*').eq('sds_id', sdsId).order('created_at', { ascending: false }).limit(1).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

const findAll = async (userId, { page = 1, limit = 20 } = {}) => {
  const from = (page - 1) * limit;
  const { data, error, count } = await supabaseAdmin
    .from(TABLE).select('id,sds_id,overall_score,status,validated_at,sds_documents(chemical_name)', { count: 'exact' })
    .eq('user_id', userId).order('validated_at', { ascending: false }).range(from, from + limit - 1);
  if (error) throw error;
  return { data, total: count };
};

module.exports = { create, findLatestBySdsId, findAll };