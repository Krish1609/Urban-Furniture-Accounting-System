import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { isSupabaseConfigured, requireSupabase } from '../lib/supabase';
import { getCurrentUser, signIn, signOut, signUp } from '../services/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    if (isSupabaseConfigured) return null;
    try {
      const saved = localStorage.getItem('furniledger_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading saved user:', e);
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return isSupabaseConfigured || Boolean(localStorage.getItem('furniledger_token') && localStorage.getItem('furniledger_user'));
  });

  const [loading, setLoading] = useState(true);

  // Verify auth session on load
  useEffect(() => {
    if (isSupabaseConfigured) {
      const supabase = requireSupabase();
      getCurrentUser().then((user) => {
        if (!user) return;
        setCurrentUser({ id: user.id, name: user.user_metadata?.display_name || user.email, loginId: user.user_metadata?.login_id || user.email, email: user.email, role: 'Administrator' });
        setIsAuthenticated(true);
        setLoading(false);
      }).catch(() => setLoading(false));
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setIsAuthenticated(Boolean(session?.user)));
      return () => listener.subscription.unsubscribe();
    }

    let mounted = true;
    const token = localStorage.getItem('furniledger_token');
    if (token) {
      api.getMe().then((res) => {
        if (!mounted) return;
        if (res && res.user) {
          const u = {
            id: res.user.id,
            name: res.user.name || res.user.loginId,
            role: res.user.role,
            loginId: res.user.loginId,
            email: res.user.email,
          };
          setCurrentUser(u);
          setIsAuthenticated(true);
          localStorage.setItem('furniledger_user', JSON.stringify(u));
        } else {
          // Token is invalid/expired
          localStorage.removeItem('furniledger_token');
          localStorage.removeItem('furniledger_user');
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
        setLoading(false);
      }).catch(() => {
        if (!mounted) return;
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
    return () => { mounted = false; };
  }, []);

  const login = async (loginId, password, role = 'Administrator') => {
    if (isSupabaseConfigured) {
      const res = await signIn(loginId, password);
      const user = res.user;
      const profile = { id: user.id, name: user.user_metadata?.display_name || user.email, role, loginId: user.user_metadata?.login_id || loginId, email: user.email };
      setCurrentUser(profile);
      setIsAuthenticated(true);
      setLoading(false);
      return { user: profile };
    }

    const res = await api.loginUser({ loginId, password, role });
    if (res && res.user) {
      const u = {
        id: res.user.id,
        name: res.user.name || res.user.loginId,
        role: res.user.role,
        loginId: res.user.loginId || loginId,
        email: res.user.email,
      };
      setCurrentUser(u);
      setIsAuthenticated(true);
      localStorage.setItem('furniledger_user', JSON.stringify(u));
      if (res.token) {
        localStorage.setItem('furniledger_token', res.token);
      }
      return { user: u };
    }
    throw new Error(res?.message || 'Authentication failed. Please check your credentials.');
  };

  const register = async (userData) => {
    if (isSupabaseConfigured) {
      return signUp({ email: userData.email, password: userData.password, loginId: userData.loginId, displayName: userData.name });
    }
    const res = await api.registerUser(userData);
    return res;
  };

  const logout = () => {
    if (isSupabaseConfigured) {
      signOut().catch((error) => console.error('Supabase sign out failed:', error));
    }
    localStorage.removeItem('furniledger_token');
    localStorage.removeItem('furniledger_user');
    setCurrentUser(null);
    setIsAuthenticated(false);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

