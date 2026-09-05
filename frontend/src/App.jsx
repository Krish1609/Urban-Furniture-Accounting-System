import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AccountingProvider } from './context/AccountingContext';

// Layout
import DashboardLayout from './components/DashboardLayout';

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
import UserPortalPage from './pages/UserPortalPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AccountingProvider>
          <Router>
            <Routes>
              {/* Public Entry Workflows */}
              <Route path="/login" element={<LoginPage />} />

              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/contacts" element={<ContactsPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/accounting" element={<AccountingPage />} />
                  <Route path="/budgets" element={<BudgetsPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                </Route>
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/create-user" element={<CreateUserPage />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
                <Route path="/my-invoices" element={<UserPortalPage view="invoices" />} />
                <Route path="/my-bills" element={<UserPortalPage view="bills" />} />
              </Route>

              {/* Legacy portal URL is role guarded and redirected by the portal routes. */}
              <Route path="/portal" element={<Navigate to="/my-invoices" replace />} />

              {/* Default Fallback */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </AccountingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}