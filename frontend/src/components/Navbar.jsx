import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sun,
  Moon,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  ChevronDown,
  ShoppingCart,
  Receipt,
  FileSpreadsheet,
  Package,
  Users,
  PieChart,
  BookOpen,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function Navbar() {
  const { theme, themeMode, toggleTheme } = useTheme();
  const { currentUser, switchRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);

  const [activeDropdown, setActiveDropdown] = useState(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setActiveDropdown(null);
  }, [location.pathname]);

  const handleRoleToggle = () => {
    const nextRole = currentUser.role === 'Administrator' ? 'User' : 'Administrator';
    switchRole(nextRole);
    if (nextRole === 'User') {
      navigate('/portal');
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = (menuName) => {
    setActiveDropdown((prev) => (prev === menuName ? null : menuName));
  };

  // Menu structure matching the user's exact flowchart
  const navMenus = [
    {
      id: 'sales',
      label: 'Sales',
      items: [
        { label: 'Sales order', path: '/orders', state: { tab: 'sales' }, icon: ShoppingCart },
        { label: 'Sale Invoice', path: '/orders', state: { tab: 'invoices', filterType: 'Customer Invoice' }, icon: Receipt },
        { label: 'Receipt', path: '/portal', icon: FileSpreadsheet },
      ],
    },
    {
      id: 'purchase',
      label: 'Purchase',
      items: [
        { label: 'Purchase Order', path: '/orders', state: { tab: 'purchase' }, icon: ShoppingCart },
        { label: 'Purchase Bill', path: '/orders', state: { tab: 'invoices', filterType: 'Vendor Bill' }, icon: Receipt },
        { label: 'Payment', path: '/accounting', state: { tab: 'journals' }, icon: DollarSign },
      ],
    },
    {
      id: 'account',
      label: 'Account',
      items: [
        { label: 'Contact', path: '/contacts', icon: Users },
        { label: 'Product', path: '/products', icon: Package },
        { label: 'Analytics', path: '/budgets', state: { tab: 'analytics' }, icon: PieChart },
        { label: 'Analytical Budget', path: '/budgets', state: { tab: 'budgets' }, icon: TrendingUp },
        { label: 'Chart of Account', path: '/accounting', state: { tab: 'coa' }, icon: BookOpen },
        { label: 'Journals', path: '/accounting', state: { tab: 'journals' }, icon: BookOpen },
        { label: 'Journal Entries', path: '/accounting', state: { tab: 'journals' }, icon: FileSpreadsheet },
      ],
    },
    {
      id: 'report',
      label: 'Report',
      items: [
        { label: 'Balancesheet', path: '/reports', state: { report: 'bs' }, icon: FileSpreadsheet },
        { label: 'Profit and Loss', path: '/reports', state: { report: 'pl' }, icon: TrendingUp },
        { label: 'Budget Report', path: '/budgets', state: { tab: 'budgets' }, icon: PieChart },
      ],
    },
  ];

  return (
    <header
      ref={navRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 2rem',
        backgroundColor: theme.bgCard,
        borderBottom: `1px solid ${theme.borderLight}`,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Left: Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
        <Link to={currentUser.role === 'Administrator' ? '/dashboard' : '/portal'} style={{ textDecoration: 'none' }}>
          <Logo theme={theme} isSmall />
        </Link>

        {/* Center: Top Navigation Bar Formatted as requested (Sales | Purchase | Account | Report) */}
        {currentUser.role === 'Administrator' && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', position: 'relative' }}>
            {navMenus.map((menu) => {
              const isOpen = activeDropdown === menu.id;

              return (
                <div key={menu.id} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => toggleMenu(menu.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.55rem 1rem',
                      borderRadius: '6px',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      backgroundColor: isOpen ? theme.bgSubtle : 'transparent',
                      color: isOpen ? theme.accentGold : theme.textMain,
                      border: isOpen ? `1px solid ${theme.borderLight}` : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 120ms ease',
                    }}
                  >
                    <span>{menu.label}</span>
                    <ChevronDown
                      size={14}
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform 180ms ease',
                        color: isOpen ? theme.accentGold : theme.textMuted,
                      }}
                    />
                  </button>

                  {/* Dropdown Menu (Open on click) */}
                  {isOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        left: 0,
                        minWidth: '220px',
                        backgroundColor: theme.bgCard,
                        border: `1px solid ${theme.borderLight}`,
                        borderRadius: '8px',
                        padding: '0.5rem',
                        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
                        zIndex: 100,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.2rem',
                      }}
                    >
                      <div
                        style={{
                          padding: '0.4rem 0.65rem 0.3rem',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: theme.accentGold,
                          borderBottom: `1px solid ${theme.borderLight}`,
                          marginBottom: '0.3rem',
                        }}
                      >
                        {menu.label} Modules
                      </div>

                      {menu.items.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setActiveDropdown(null);
                              navigate(item.path, { state: item.state });
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.65rem',
                              padding: '0.55rem 0.75rem',
                              borderRadius: '5px',
                              fontSize: '0.82rem',
                              fontWeight: 500,
                              color: theme.textMain,
                              backgroundColor: 'transparent',
                              border: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              width: '100%',
                              transition: 'background-color 100ms ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = theme.bgSubtle;
                              e.currentTarget.style.color = theme.accentGold;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = theme.textMain;
                            }}
                          >
                            <Icon size={14} style={{ color: theme.accentGold, flexShrink: 0 }} />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        )}
      </div>

      {/* Right Controls: Role, Theme, Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Role Switcher Pill */}
        <button
          type="button"
          onClick={handleRoleToggle}
          title="Click to toggle role perspective"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.4rem 0.85rem',
            backgroundColor: theme.bgSubtle,
            border: `1px solid ${theme.borderLight}`,
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: theme.accentGold,
            cursor: 'pointer',
          }}
        >
          {currentUser.role === 'Administrator' ? <ShieldCheck size={14} /> : <UserIcon size={14} />}
          <span>Role: {currentUser.role}</span>
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.8rem',
            border: `1px solid ${theme.borderLight}`,
            backgroundColor: theme.bgSubtle,
            color: theme.textMuted,
            fontSize: '0.75rem',
            fontWeight: 600,
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          {themeMode === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
          <span>{themeMode === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          title="Log out of FurniLedger"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.8rem',
            border: `1px solid ${theme.borderLight}`,
            backgroundColor: 'transparent',
            color: theme.textMuted,
            fontSize: '0.75rem',
            fontWeight: 600,
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          <LogOut size={13} />
          <span>Exit</span>
        </button>
      </div>
    </header>
  );
}
