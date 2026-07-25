const { supabaseAdmin } = require('../config/database');

const SESSIONS_TABLE = 'chat_sessions';
const MESSAGES_TABLE = 'chat_messages';

// Sessions

const createSession = async ({ user_id, sds_id, title }) => {
  const { data, error } = await supabaseAdmin
    .from(SESSIONS_TABLE)
    .insert({ user_id, sds_id, title })
    .select()
    .single();
  if (error) throw error;
  return data;
};

const findOrCreateSession = async (userId, sdsId) => {
  // Return existing active session for this user+sds combo
  const { data: existing } = await supabaseAdmin
    .from(SESSIONS_TABLE)
    .select('*')
    .eq('user_id', userId)
    .eq('sds_id', sdsId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (existing) return existing;

  return createSession({ user_id: userId, sds_id: sdsId, title: 'SDS Chat' });
};

const findSessionById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from(SESSIONS_TABLE)
    .select('*')
    .eq('id', id)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// Messages

const addMessage = async ({ session_id, role, content, tokens_used }) => {
  const { data, error } = await supabaseAdmin
    .from(MESSAGES_TABLE)
    .insert({ session_id, role, content, tokens_used })
    .select()
    .single();
  if (error) throw error;
  return data;
};

const getHistory = async (sessionId, limit = 20) => {
  const { data, error } = await supabaseAdmin
    .from(MESSAGES_TABLE)
    .select('role,content,created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data;
};

const getSessionsByUser = async (userId, sdsId) => {
  let query = supabaseAdmin
    .from(SESSIONS_TABLE)
    .select('id,sds_id,title,created_at,sds_documents(chemical_name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (sdsId) query = query.eq('sds_id', sdsId);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

module.exports = {
  createSession,
  findOrCreateSession,
  findSessionById,
  addMessage,
  getHistory,
  getSessionsByUser,
};
