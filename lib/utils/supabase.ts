import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Fail gracefully or provide a mock for local development if keys are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'MISSING SUPABASE CREDENTIALS: Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Server-side client with elevated privileges to bypass RLS in Server Actions
export const getSupabaseServer = () => {
  if (!supabaseServiceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is missing. Server actions will use anon key and may fail due to RLS.');
    return supabase;
  }
  return createClient(supabaseUrl!, supabaseServiceRoleKey);
};
