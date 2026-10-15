import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl !== 'https://your-project-ref.supabase.co' &&
  (supabaseAnonKey || supabaseServiceRoleKey)
);

// Client using Anon key (respects RLS)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey || supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

// Admin client using Service Role key (bypasses RLS for system operations)
export const supabaseAdmin = Boolean(supabaseUrl && supabaseServiceRoleKey && supabaseServiceRoleKey !== 'your_supabase_service_role_key_here')
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : supabase;

if (isSupabaseConfigured) {
  console.log(`⚡ Supabase client initialized for: ${supabaseUrl}`);
} else {
  console.log('ℹ️  Supabase URL/Key not configured in backend/.env. Using PostgreSQL / resilient local store adapter.');
}
