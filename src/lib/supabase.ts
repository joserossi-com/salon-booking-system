import { createClient, SupabaseClient } from "@supabase/supabase-js";

function getEnv(key: string): string {
  const val = process.env[key]?.trim();
  if (!val) throw new Error(`Variable de entorno faltante: ${key}`);
  return val;
}

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

// Cliente para el dashboard (respeta RLS con sesión del usuario)
export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      getEnv("NEXT_PUBLIC_SUPABASE_URL"),
      getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    );
  }
  return _supabase;
}

// Cliente admin para API routes del bot (bypasea RLS)
export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      getEnv("NEXT_PUBLIC_SUPABASE_URL"),
      getEnv("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }
  return _supabaseAdmin;
}

// Alias conveniente — se resuelven en runtime, no en build time
export const supabase      = { get: getSupabase };
export const supabaseAdmin = { get: getSupabaseAdmin };
