import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('furniledger_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading saved user:', e);
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem('furniledger_token') && localStorage.getItem('furniledger_user'));
  });

  const [loading, setLoading] = useState(true);

  // Verify auth session on load
  useEffect(() => {
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
    const res = await api.registerUser(userData);
    return res;
  };

  const logout = () => {
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

