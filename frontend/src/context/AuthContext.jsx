import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { isSupabaseConfigured, requireSupabase } from '../lib/supabase';
import { signOut, signUp } from '../services/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return undefined;
    }

    const supabase = requireSupabase();
    setLoading(false);
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session?.user));
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async (loginId, password) => {
    const response = await api.loginUser({ loginId, password });
    const user = response.user;
    if (!user?.id || !user?.role) throw new Error('Login response did not include a valid user role');
    localStorage.setItem('furniledger_token', response.token);
    setCurrentUser({
      id: user.id,
      name: user.display_name,
      loginId: user.login_id,
      email: user.email,
      role: user.role,
      organizationId: user.organization_id,
      contactId: user.contact_id,
    });
    setIsAuthenticated(true);
    return response;
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
    if (isSupabaseConfigured) signOut().catch((error) => console.error('Supabase sign out failed:', error));
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('furniledger_token');
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
