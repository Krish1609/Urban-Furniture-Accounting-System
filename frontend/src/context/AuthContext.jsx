import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

function normalizeRole(storedRole) {
  const role = String(storedRole ?? '').toLowerCase();
  return role === 'user' || role === 'contact_portal' ? 'User' : 'Administrator';
}

function normalizeUser(user, membershipRole) {
  if (!user) return null;

  const storedRole = user.user_metadata?.role ?? membershipRole;

  return {
    ...user,
    name: user.user_metadata?.display_name ?? user.email,
    loginId: user.user_metadata?.login_id ?? '',
    role: normalizeRole(storedRole),
  };
}

async function loadUserWithRole(user) {
  if (!user) return null;
  if (user.user_metadata?.role) return normalizeUser(user);

  const { data } = await supabase
    .from('organization_memberships')
    .select('role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  return normalizeUser(user, data?.role);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      setCurrentUser(await loadUserWithRole(session?.user));
      setIsAuthenticated(Boolean(session?.user));
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setIsAuthenticated(Boolean(session?.user));
      loadUserWithRole(session?.user).then((loadedUser) => {
        if (mounted) setCurrentUser(loadedUser);
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (loginId, password) => {
    const email = loginId.includes('@') ? loginId : undefined;
    if (!email) {
      throw new Error('Sign in with the email address used to create the account.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const authenticatedUser = await loadUserWithRole(data.user);
    setCurrentUser(authenticatedUser);
    setIsAuthenticated(Boolean(data.user));
    return { ...data, role: authenticatedUser.role };
  };

  const register = async (userData) => {
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        login_id: userData.loginId,
        display_name: userData.name,
        role: userData.role,
      },
    },
  });

  if (error) throw error;

  return data;
};

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const switchRole = () => {};

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
