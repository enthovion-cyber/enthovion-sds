const { supabaseAdmin } = require('../config/database');

const TABLE = 'sds_documents';

const create = async (sdsData) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert({ ...sdsData, version: 1, status: 'draft' })
    .select()
    .single();
  if (error) throw error;
  return data;
};

const findById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    // Add !user_id after the table name to resolve the ambiguity
    .select('*, users!user_id(name, email)') 
    .eq('id', id)
    .is('deleted_at', null) // Use .is('deleted_at', null) for proper SQL NULL checking
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

const findAll = async ({ userId, page = 1, limit = 20, search, status, language, jurisdiction }) => {
  let query = supabaseAdmin
    .from(TABLE)
    .select('id,chemical_name,cas_number,language,jurisdiction,status,version,compliance_score,expires_at,created_at,updated_at', { count: 'exact' })
    .is('deleted_at', null)
    .eq('user_id', userId);

  if (search) {
    query = query.or(
      `chemical_name.ilike.%${search}%,cas_number.ilike.%${search}%,product_code.ilike.%${search}%`
    );
  }
  if (status) query = query.eq('status', status);
  if (language) query = query.eq('language', language);
  if (jurisdiction) query = query.eq('jurisdiction', jurisdiction);

  const from = (page - 1) * limit;
  query = query.order('updated_at', { ascending: false }).range(from, from + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, total: count };
};

const update = async (id, updates) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const softDelete = async (id) => {
  const { error } = await supabaseAdmin
    .from(TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
};

const updateComplianceScore = async (id, score) => {
  return update(id, { compliance_score: score, last_audited_at: new Date().toISOString() });
};

const findExpiring = async (userId, daysAhead = 90) => {
  const cutoff = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('id,chemical_name,expires_at,compliance_score')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .lte('expires_at', cutoff)
    .order('expires_at', { ascending: true });
  if (error) throw error;
  return data;
};

const getDashboardStats = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('status,compliance_score,expires_at')
    .eq('user_id', userId)
    .is('deleted_at', null);
  if (error) throw error;

  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return {
    total: data.length,
    approved: data.filter((d) => d.status === 'approved').length,
    draft: data.filter((d) => d.status === 'draft').length,
    expiringSoon: data.filter((d) => d.expires_at && new Date(d.expires_at) <= in30Days).length,
    avgComplianceScore: data.length
      ? Math.round(data.reduce((s, d) => s + (d.compliance_score || 0), 0) / data.length)
      : 0,
    nonCompliant: data.filter((d) => d.compliance_score !== null && d.compliance_score < 60).length,
  };
};

module.exports = { create, findById, findAll, update, softDelete, updateComplianceScore, findExpiring, getDashboardStats };
