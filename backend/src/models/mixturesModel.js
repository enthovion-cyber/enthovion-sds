const { supabaseAdmin } = require('../config/database');
const TABLE = 'mixture_formulations';

const create = async (data) => {
  const { data: result, error } = await supabaseAdmin.from(TABLE).insert(data).select().single();
  if (error) throw error;
  return result;
};

const findById = async (id) => {
  const { data, error } = await supabaseAdmin.from(TABLE).select('*').eq('id', id).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

const findAll = async (userId, { page = 1, limit = 20 } = {}) => {
  const from = (page - 1) * limit;
  const { data, error, count } = await supabaseAdmin
    .from(TABLE).select('*', { count: 'exact' })
    .eq('user_id', userId).order('created_at', { ascending: false })
    .range(from, from + limit - 1);
  if (error) throw error;
  return { data, total: count };
};

const update = async (id, updates) => {
  const { data, error } = await supabaseAdmin.from(TABLE).update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

const remove = async (id) => {
  const { error } = await supabaseAdmin.from(TABLE).delete().eq('id', id);
  if (error) throw error;
};

module.exports = { create, findById, findAll, update, remove };




