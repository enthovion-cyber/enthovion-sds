const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

const supabaseUrl = env.supabase.url || 'https://placeholder.supabase.co';
const serviceRoleKey = env.supabase.serviceRoleKey || 'placeholder-key';
const anonKey = env.supabase.anonKey || serviceRoleKey;

// Service-role client — bypasses RLS — for server-side operations only
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Anon client — respects RLS — for operations that should honor row-level security
const supabaseClient = createClient(supabaseUrl, anonKey);

const testConnection = async () => {
  if (!env.supabase.url || !env.supabase.serviceRoleKey) {
    console.warn('⚠️ Supabase connection skipped: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return;
  }

  try {
    const { error } = await supabaseAdmin.from('users').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      console.warn('⚠️ Supabase connection check warning:', error.message);
    } else {
      console.log('✅ Supabase connected');
    }
  } catch (err) {
    console.warn('⚠️ Supabase ping failed:', err.message);
  }
};

module.exports = { supabaseAdmin, supabaseClient, testConnection };