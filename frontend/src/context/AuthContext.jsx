import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { isSupabaseConfigured, requireSupabase } from '../lib/supabase';
import { signIn, signOut, signUp } from '../services/auth';

const AuthContext = createContext();

function normalizeRole(storedRole) {
  const role = String(storedRole ?? '').toLowerCase();
  return role === 'user' || role === 'contact_portal' ? 'User' : 'Administrator';
}

function normalizeUser(user, membershipRole) {
  if (!user) return null;

  return {
    ...user,
    name: user.user_metadata?.display_name ?? user.email,
    loginId: user.user_metadata?.login_id ?? user.email,
    email: user.email,
    role: normalizeRole(user.user_metadata?.role ?? membershipRole),
  };
}

async function loadUserWithRole(user) {
  if (!user) return null;
  if (user.user_metadata?.role) return normalizeUser(user);

  const { data } = await requireSupabase()
    .from('organization_memberships')
    .select('role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  return normalizeUser(user, data?.role);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(
    isSupabaseConfigured
      ? null
      : { name: 'Admin User', loginId: 'admin_demo', email: 'admin@urbanfurniture.com', role: 'Administrator' },
  );
  const [isAuthenticated, setIsAuthenticated] = useState(!isSupabaseConfigured);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let mounted = true;
    const client = requireSupabase();

    client.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      setCurrentUser(await loadUserWithRole(session?.user));
      setIsAuthenticated(Boolean(session?.user));
      setLoading(false);
    });

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setIsAuthenticated(Boolean(session?.user));
      loadUserWithRole(session?.user).then((user) => {
        if (mounted) setCurrentUser(user);
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (loginId, password, role = 'Administrator') => {
    if (isSupabaseConfigured) {
      const email = loginId.includes('@') ? loginId : undefined;
      if (!email) {
        throw new Error('Sign in with the email address used to create the account.');
      }

      const data = await signIn(email, password);
      const user = await loadUserWithRole(data.user);
      setCurrentUser(user);
      setIsAuthenticated(true);
      return { ...data, role: user.role };
    }

    const response = await api.loginUser({ loginId, password, role });
    const user = {
      name: role === 'Administrator' ? 'Admin Manager' : 'Nimesh Pathak',
      loginId,
      email: role === 'Administrator' ? 'admin@urbanfurniture.com' : 'nimesh.pathak@client.com',
      role,
    };
    setCurrentUser(user);
    setIsAuthenticated(true);
    return { ...response, role: user.role };
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

  const logout = async () => {
    if (isSupabaseConfigured) await signOut();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const switchRole = (newRole) => {
    setCurrentUser((previousUser) => (previousUser ? { ...previousUser, role: newRole } : previousUser));
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, loading, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
