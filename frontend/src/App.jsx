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

              {/* Main Authenticated ERP & Portal Pages */}
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/contacts" element={<ContactsPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/accounting" element={<AccountingPage />} />
                <Route path="/budgets" element={<BudgetsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/portal" element={<UserPortalPage />} />
              </Route>

              {/* Default Fallback */}
              <Route path="/" element={<Navigate to="/create-user" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </AccountingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
