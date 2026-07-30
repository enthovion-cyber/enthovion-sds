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

const findAll = async ({
  userId,
  page = 1,
  limit = 20,
  search,
  status,
  compliance_status,
  validation_status,
  publication_status,
  review_due,
  language,
  jurisdiction,
  sort = 'updated_at.desc'
}) => {
  let query = supabaseAdmin
    .from(TABLE)
    .select('*, users!owner_id(name, email)', { count: 'exact' })
    .is('deleted_at', null)
    .eq('user_id', userId);

  if (search) {
    query = query.or(
      `chemical_name.ilike.%${search}%,cas_number.ilike.%${search}%,product_code.ilike.%${search}%`
    );
  }
  
  if (status) query = query.in('lifecycle_status', status.split(','));
  if (validation_status) query = query.in('validation_status', validation_status.split(','));
  if (publication_status) query = query.in('publication_status', publication_status.split(','));
  if (language) query = query.in('language', language.split(','));
  if (jurisdiction) query = query.in('jurisdiction', jurisdiction.split(','));
  
  // Example for compliance status
  if (compliance_status) {
    const statuses = compliance_status.split(',');
    if (statuses.includes('critical')) query = query.lt('compliance_score', 50);
    else if (statuses.includes('major_gaps')) query = query.gte('compliance_score', 50).lt('compliance_score', 75);
    else if (statuses.includes('acceptable')) query = query.gte('compliance_score', 75).lt('compliance_score', 90);
    else if (statuses.includes('strong')) query = query.gte('compliance_score', 90);
  }

  if (review_due) {
    const days = parseInt(review_due, 10);
    if (!isNaN(days)) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      query = query.lte('review_date', targetDate.toISOString());
    }
  }

  const [sortCol, sortDir] = sort.split('.');
  const isAscending = sortDir === 'asc';

  const from = (page - 1) * limit;
  query = query.order(sortCol || 'updated_at', { ascending: isAscending }).range(from, from + limit - 1);

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

const getLibrarySummaryStats = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('lifecycle_status,publication_status,validation_status,compliance_score,review_date')
    .eq('user_id', userId)
    .is('deleted_at', null);
  if (error) throw error;

  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return {
    total: data.length,
    approved: data.filter((d) => d.lifecycle_status === 'approved').length,
    published: data.filter((d) => d.publication_status === 'published').length,
    awaitingReview: data.filter((d) => ['submitted', 'technical_review', 'regulatory_review'].includes(d.lifecycle_status)).length,
    criticalIssues: data.filter((d) => d.compliance_score !== null && d.compliance_score < 50).length,
    expired: data.filter((d) => d.lifecycle_status === 'expired').length,
    reviewDue: data.filter((d) => d.review_date && new Date(d.review_date) <= in30Days).length,
    missingPublished: data.filter((d) => d.publication_status === 'not_published').length,
  };
};

module.exports = { create, findById, findAll, update, softDelete, updateComplianceScore, findExpiring, getDashboardStats, getLibrarySummaryStats };
