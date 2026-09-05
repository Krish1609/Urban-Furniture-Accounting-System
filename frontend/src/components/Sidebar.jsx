import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BookOpen,
  PieChart,
  FileText,
  Receipt
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { theme } = useTheme();
  const { currentUser } = useAuth();

  const adminNavLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/contacts', label: 'Contacts Master', icon: Users },
    { to: '/products', label: 'Product Master', icon: Package },
    { to: '/orders', label: 'Orders & Invoices', icon: ShoppingCart },
    { to: '/accounting', label: 'CoA & Journals', icon: BookOpen },
    { to: '/budgets', label: 'Budgets & Analytics', icon: PieChart },
    { to: '/reports', label: 'Financial Reports', icon: FileText },
  ];

  const userNavLinks = [
    { to: '/portal', label: 'My Invoices & Dues', icon: Receipt },
  ];

  const links = currentUser.role === 'Administrator' ? adminNavLinks : userNavLinks;

  return (
    <aside
      style={{
        width: '230px',
        backgroundColor: theme.bgCard,
        borderRight: `1px solid ${theme.borderLight}`,
        padding: '1.5rem 0.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
      }}
    >
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.84rem',
              fontWeight: isActive ? 600 : 500,
              textDecoration: 'none',
              color: isActive ? theme.textMain : theme.textMuted,
              backgroundColor: isActive ? theme.bgSubtle : 'transparent',
              border: isActive ? `1px solid ${theme.borderLight}` : '1px solid transparent',
              transition: 'all 140ms ease',
            })}
          >
            <Icon size={16} />
            <span>{link.label}</span>
          </NavLink>
        );
      })}
    </aside>
  );
}
