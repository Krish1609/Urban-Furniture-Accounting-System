import { requireSupabase } from '../lib/supabase';

export async function signUp({ email, password, loginId, displayName }) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        login_id: loginId,
        display_name: displayName,
      },
    },
  });

  if (error) throw error;

  return data;
}

export async function signIn(email, password) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data;
}

export async function signOut() {
  const supabase = requireSupabase();
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}

export async function getCurrentUser() {
  const supabase = requireSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}