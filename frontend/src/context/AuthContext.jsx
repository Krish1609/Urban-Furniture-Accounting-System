import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { isSupabaseConfigured, requireSupabase } from '../lib/supabase';
import { getCurrentUser, signIn, signOut, signUp } from '../services/auth';

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
<<<<<<< HEAD
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
=======
  const [currentUser, setCurrentUser] = useState(
    isSupabaseConfigured
      ? null
      : { name: 'Admin User', loginId: 'admin_demo', email: 'admin@urbanfurniture.com', role: 'Administrator' },
  );
  const [isAuthenticated, setIsAuthenticated] = useState(!isSupabaseConfigured);
>>>>>>> bbe208314c9ddfb02c6872881a9fab2b25411759

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

<<<<<<< HEAD
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      setCurrentUser(await loadUserWithRole(session?.user));
=======
    const supabase = requireSupabase();
    getCurrentUser().then((user) => {
      if (!user) return;
      setCurrentUser({
        name: user.user_metadata?.display_name || user.email,
        loginId: user.user_metadata?.login_id || user.email,
        email: user.email,
        role: 'Administrator',
      });
      setIsAuthenticated(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
>>>>>>> bbe208314c9ddfb02c6872881a9fab2b25411759
      setIsAuthenticated(Boolean(session?.user));
      setLoading(false);
    });

<<<<<<< HEAD
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
=======
    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async (loginId, password, role = 'Administrator') => {
    if (isSupabaseConfigured) {
      const user = await signIn(loginId, password);
      setCurrentUser({
        name: user.user?.user_metadata?.display_name || user.user?.email,
        loginId: user.user?.user_metadata?.login_id || loginId,
        email: user.user?.email,
        role,
      });
      setIsAuthenticated(true);
      return user;
    }

    const response = await api.loginUser({ loginId, password, role });
    setCurrentUser({
      name: role === 'Administrator' ? 'Admin Manager' : 'Nimesh Pathak',
      loginId,
      email: role === 'Administrator' ? 'admin@urbanfurniture.com' : 'nimesh.pathak@client.com',
      role,
    });
    setIsAuthenticated(true);
    return response;
>>>>>>> bbe208314c9ddfb02c6872881a9fab2b25411759
  };

  const register = async (userData) => {
    if (isSupabaseConfigured) {
      return signUp({
        email: userData.email,
        password: userData.password,
        loginId: userData.loginId,
        displayName: userData.name,
        role: userData.role,
      });
    }
    return api.registerUser(userData);
  };

  const logout = () => {
    if (isSupabaseConfigured) {
      signOut().catch((error) => console.error('Supabase sign out failed:', error));
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const switchRole = (newRole) => {
    setCurrentUser((prev) => (prev ? { ...prev, role: newRole } : prev));
  };

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
