import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AccountingProvider } from './context/AccountingContext';

// Layout
import DashboardLayout from './components/DashboardLayout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Modular Dedicated Pages
import CreateUserPage from './pages/CreateUserPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ContactsPage from './pages/ContactsPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import AccountingPage from './pages/AccountingPage';
import BudgetsPage from './pages/BudgetsPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import UserPortalPage from './pages/UserPortalPage';

// Dedicated Super Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminAuditPage from './pages/admin/AdminAuditPage';
import AdminSystemPage from './pages/admin/AdminSystemPage';

function RootRedirect() {
  const { currentUser, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (currentUser.role === 'Administrator') {
    return <Navigate to="/admin" replace />;
  }
  if (currentUser.role === 'User') {
    return <Navigate to="/portal" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AccountingProvider>
          <Router>
            <Routes>
              {/* Public Entry Workflows */}
              <Route path="/create-user" element={<CreateUserPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* 👑 Dedicated Super Admin Panel (Administrator Only) */}
              <Route element={<ProtectedRoute allowedRoles={['Administrator']} />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="company" element={<AdminDashboardPage />} />
                  <Route path="audit" element={<AdminAuditPage />} />
                  <Route path="system" element={<AdminSystemPage />} />
                </Route>
              </Route>

              {/* Main Authenticated ERP & Portal Pages */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  {/* ERP Admin & Accountant Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['Administrator', 'Accountant']} />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/contacts" element={<ContactsPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/accounting" element={<AccountingPage />} />
                    <Route path="/budgets" element={<BudgetsPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/users" element={<UsersPage />} />
                  </Route>

                  {/* Portal Route accessible to all authenticated roles */}
                  <Route path="/portal" element={<UserPortalPage />} />
                </Route>
              </Route>

              {/* Default Fallback */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </AccountingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}