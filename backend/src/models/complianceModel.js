const { supabaseAdmin } = require('../config/database');

const TABLE = 'compliance_audits';

const isMissingColumnError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return error?.code === 'PGRST204' || message.includes('column') || message.includes('schema cache');
};

const create = async ({
  sds_id,
  jurisdiction,
  score,
  score_breakdown = null,
  status = null,
  summary = null,
  standard = null,
  gaps = [],
  section_checks = null,
  passed_checks = [],
  recommendations = [],
  audited_at = null,
  run_by,
}) => {
  const payload = {
    sds_id,
    jurisdiction,
    score,
    score_breakdown,
    status,
    summary,
    standard,
    gaps,
    section_checks,
    passed_checks,
    recommendations,
    audited_at,
    run_by,
  };

  const attemptInsert = async (row) => {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    return data;
  };

  try {
    return await attemptInsert(payload);
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;
    return await attemptInsert({ sds_id, jurisdiction, score, gaps, run_by });
  }
};

const findLatestBySdsId = async (sdsId, jurisdiction) => {
  let query = supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('sds_id', sdsId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (jurisdiction) query = query.eq('jurisdiction', jurisdiction);

  const { data, error } = await query.single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

const findAllBySdsId = async (sdsId) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('sds_id', sdsId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

module.exports = { create, findLatestBySdsId, findAllBySdsId };
