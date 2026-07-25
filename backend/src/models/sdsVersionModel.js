const { supabaseAdmin } = require('../config/database');

const TABLE = 'sds_versions';

const create = async ({ sds_id, version, sections, changed_by, change_summary }) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert({ sds_id, version, sections, changed_by, change_summary })
    .select()
    .single();
  if (error) throw error;
  return data;
};

const findBySdsId = async (sdsId) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('id,version,change_summary,changed_by,created_at,users(name)')
    .eq('sds_id', sdsId)
    .order('version', { ascending: false });
  if (error) throw error;
  return data;
};

const findByVersion = async (sdsId, version) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('sds_id', sdsId)
    .eq('version', version)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

module.exports = { create, findBySdsId, findByVersion };
