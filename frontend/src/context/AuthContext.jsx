import { createContext, useContext, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState({
    name: 'Admin User',
    loginId: 'admin_demo',
    email: 'admin@urbanfurniture.com',
    role: 'Administrator', // 'Administrator' | 'User'
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = async (loginId, password, role = 'Administrator') => {
    const res = await api.loginUser({ loginId, password, role });
    setCurrentUser({
      name: role === 'Administrator' ? 'Admin Manager' : 'Nimesh Pathak',
      loginId,
      email: role === 'Administrator' ? 'admin@urbanfurniture.com' : 'nimesh.pathak@client.com',
      role,
    });
    setIsAuthenticated(true);
    return res;
  };

  const register = async (userData) => {
    const res = await api.registerUser(userData);
    return res;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const switchRole = (newRole) => {
    setCurrentUser((prev) => ({
      ...prev,
      role: newRole,
      name: newRole === 'Administrator' ? 'Admin Manager' : 'Nimesh Pathak',
    }));
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
