const { supabaseAdmin } = require('../config/database');

const TABLE = 'otp_codes';

const create = async ({ user_id, code_hash, purpose, expires_at }) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert({ user_id, code_hash, purpose, expires_at })
    .select()
    .single();
  if (error) throw error;
  return data;
};

const findLatest = async (userId, purpose) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .eq('purpose', purpose)
    .is('used_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

const markUsed = async (id) => {
  const { error } = await supabaseAdmin
    .from(TABLE)
    .update({ used_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
};

const invalidatePrevious = async (userId, purpose) => {
  const { error } = await supabaseAdmin
    .from(TABLE)
    .update({ used_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('purpose', purpose)
    .is('used_at', null);
  if (error) throw error;
};

const deleteExpired = async () => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .delete()
    .lt('expires_at', new Date().toISOString())
    .select('id');
  if (error) throw error;
  return data?.length || 0;
};

module.exports = { create, findLatest, markUsed, invalidatePrevious, deleteExpired };
