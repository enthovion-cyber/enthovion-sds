const { supabaseAdmin } = require('../config/database');

const TABLE = 'sop_documents';

/**
 * Helper to validate UUIDs to prevent 500 errors on malformed strings
 */
const isValidUUID = (uuid) => {
  const re = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return re.test(uuid);
};

const create = async (sopData) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert({ 
      ...sopData, 
      version: 1, 
      status: 'draft',
      updated_at: new Date().toISOString() 
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

const findById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select(`*`) // Simplified for now
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error in findById:', error.message);
    throw error;
  }
  return data;
};

const findAll = async ({ userId, page = 1, limit = 20, language, type, sdsId }) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // REMOVED the sds_documents(...) join part to prevent the error
    let query = supabaseAdmin
      .from(TABLE)
      .select(`
        id, 
        sds_id, 
        language, 
        type, 
        status, 
        version, 
        created_at, 
        updated_at
      `, { count: 'exact' })
      .eq('user_id', userId);

    if (language) query = query.eq('language', language);
    if (type) query = query.eq('type', type);
    if (sdsId) query = query.eq('sds_id', sdsId);

    const { data, error, count } = await query
      .order('updated_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    
    return { data: data || [], total: count || 0 };

  } catch (err) {
    console.error('Database Error in findAll:', err.message);
    throw err; 
  }
};

const update = async (id, updates) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update({ 
      ...updates, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

module.exports = { create, findById, findAll, update };