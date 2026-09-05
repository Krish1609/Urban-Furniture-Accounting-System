// Supabase client stub - the application uses the MySQL + Express backend by default
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
export const supabase = null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. The application is configured to use the Express + MySQL backend.'
    );
  }
  return supabase;
}

