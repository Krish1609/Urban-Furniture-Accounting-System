import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { isSupabaseConfigured, requireSupabase } from '../lib/supabase';
import { getCurrentUser, signIn, signOut, signUp } from '../sevices/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(
    isSupabaseConfigured
      ? null
      : { name: 'Admin User', loginId: 'admin_demo', email: 'admin@urbanfurniture.com', role: 'Administrator' }
  );
  const [isAuthenticated, setIsAuthenticated] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

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
      setIsAuthenticated(Boolean(session?.user));
    });

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
  };

  const register = async (userData) => {
<<<<<<< HEAD
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
=======
    if (isSupabaseConfigured) {
      return signUp({ email: userData.email, password: userData.password, loginId: userData.loginId, displayName: userData.name });
    }
    return api.registerUser(userData);
  };
>>>>>>> cbd50c5f69547908430094811035b24537bcc465

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
