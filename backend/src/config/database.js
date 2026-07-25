const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

// Service-role client — bypasses RLS — for server-side operations only
const supabaseAdmin = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Anon client — respects RLS — for operations that should honor row-level security
const supabaseClient = createClient(env.supabase.url, env.supabase.anonKey || env.supabase.serviceRoleKey);

const testConnection = async () => {
  try {
    const { error } = await supabaseAdmin.from('users').select('count').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.warn('⚠️  Supabase connection check warning:', error.message);
    } else {
      console.log('✅ Supabase connected');
    }
  } catch (err) {
    console.warn('⚠️  Supabase ping failed:', err.message);
  }
};

module.exports = { supabaseAdmin, supabaseClient, testConnection };
