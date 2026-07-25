const { supabaseAdmin } = require('../config/database');

const TABLE = 'users';

const findById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

const findByEmail = async (email) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

const create = async ({ name, email, passwordHash, role = 'ehs_manager' }) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert({
      name,
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      role,
      email_verified: false,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

const updateEmailVerified = async (id) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update({ email_verified: true, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const updatePassword = async (id, passwordHash) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const updateProfile = async (id, updates) => {
  const allowed = ['name', 'phone', 'company', 'job_title', 'preferred_language'];
  const sanitised = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowed.includes(k))
  );
  sanitised.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update(sanitised)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Safe user object — never returns password_hash
const sanitise = (user) => {
  if (!user) return null;
  const { password_hash, ...safe } = user;
  return safe;
};

module.exports = { findById, findByEmail, create, updateEmailVerified, updatePassword, updateProfile, sanitise };
