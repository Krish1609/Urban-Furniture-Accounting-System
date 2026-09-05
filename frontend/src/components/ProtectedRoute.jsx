import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const role = currentUser?.role;
  if (role === 'USER' && !allowedRoles.includes('USER')) {
    return <Navigate to="/my-invoices" replace />;
  }
  if (['ADMIN', 'ACCOUNTANT'].includes(role) && allowedRoles.includes('USER')) {
    return <Navigate to="/dashboard" replace />;
  }
  if (allowedRoles.length && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace state={{ unauthorized: true, from: location }} />;
  }

  return <Outlet />;
}