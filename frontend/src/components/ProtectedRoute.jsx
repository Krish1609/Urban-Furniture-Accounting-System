import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { currentUser, isAuthenticated, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: theme.bgApp,
          color: theme.textMain,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.95rem',
        }}
      >
        Loading FurniLedger...
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    if (currentUser.role === 'User') {
      return <Navigate to="/portal" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
