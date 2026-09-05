const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
export const supabase = null;

export function requireSupabase() {
  throw new Error(
    'Supabase is not configured. FurniLedger is connected directly to MySQL via Express REST API.'
  );
}

