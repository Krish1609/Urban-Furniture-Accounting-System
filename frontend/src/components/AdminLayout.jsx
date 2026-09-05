import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Users,
  Building,
  ShieldAlert,
  Database,
  Sun,
  Moon,
  LogOut,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  UserCheck,
  Activity,
  Sliders,
  ShoppingCart,
  BookOpen,
  PieChart,
  TrendingUp,
  Layers
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function AdminLayout() {
  const { theme, themeMode, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminGovernanceLinks = [
    { to: '/admin', label: 'Admin Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'User & Staff Management', icon: Users },
    { to: '/admin/company', label: 'Organization & Master', icon: Building },
    { to: '/admin/audit', label: 'Security & Audit Trail', icon: ShieldAlert },
    { to: '/admin/system', label: 'Database & System Health', icon: Database },
  ];

  const erpAccountingLinks = [
    { to: '/dashboard', label: 'Accountant ERP Hub', icon: Activity },
    { to: '/orders', label: 'Sales & Purchase Orders', icon: ShoppingCart },
    { to: '/accounting', label: 'CoA & Journals', icon: BookOpen },
    { to: '/budgets', label: 'Budgets & Analytics', icon: PieChart },
    { to: '/reports', label: 'Financial Reports', icon: TrendingUp },
    { to: '/contacts', label: 'Contacts Master', icon: UserCheck },
    { to: '/products', label: 'Products Master', icon: Layers },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: theme.bgApp, color: theme.textMain }}>
      {/* 1. SUPER ADMIN TOP HEADER */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 2rem',
          backgroundColor: theme.bgCard,
          borderBottom: `1px solid ${theme.borderLight}`,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 14px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Left: Brand Logo + Super Admin Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/admin" style={{ textDecoration: 'none' }}>
            <Logo theme={theme} isSmall />
          </Link>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.3rem 0.75rem',
              borderRadius: '20px',
              backgroundColor: theme.accentGoldSoft,
              color: theme.accentGold,
              fontSize: '0.74rem',
              fontWeight: 800,
              border: `1px solid ${theme.accentGold}`,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <Shield size={14} />
            <span>Super Admin Console</span>
          </div>
        </div>

        {/* Right Controls: Database Vitals, Jump to ERP, Theme, Admin Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* DB Live Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              backgroundColor: theme.successBg,
              color: theme.success,
              fontSize: '0.74rem',
              fontWeight: 700,
              border: `1px solid ${theme.success}`,
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: theme.success }} />
            <span>MySQL Enterprise Live</span>
          </div>

          {/* Jump to Accountant ERP Workspace */}
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.95rem',
              borderRadius: '6px',
              backgroundColor: theme.bgSubtle,
              color: theme.textMain,
              border: `1px solid ${theme.borderLight}`,
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 140ms ease',
            }}
          >
            <span>Open Accountant ERP</span>
            <ExternalLink size={13} style={{ color: theme.accentGold }} />
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            title={themeMode === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: theme.bgSubtle,
              border: `1px solid ${theme.borderLight}`,
              color: theme.textMain,
              cursor: 'pointer',
            }}
          >
            {themeMode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Admin Profile Dropdown */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '24px',
                backgroundColor: theme.bgSubtle,
                border: `1px solid ${theme.borderLight}`,
                color: theme.textMain,
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: theme.accentGold,
                  color: '#0E0D0C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                }}
              >
                A
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{currentUser?.name || 'Administrator'}</span>
              <ChevronDown size={14} style={{ color: theme.textDim }} />
            </button>

            {profileDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '115%',
                  width: '210px',
                  backgroundColor: theme.bgCard,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  padding: '0.5rem 0',
                  zIndex: 200,
                }}
              >
                <div style={{ padding: '0.6rem 1rem', borderBottom: `1px solid ${theme.borderLight}` }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.textMain, display: 'block' }}>
                    {currentUser?.name || 'Administrator'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: theme.accentGold, fontWeight: 600 }}>
                    👑 Primary Super Admin
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/admin/users');
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    padding: '0.6rem 1rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: theme.textMain,
                    fontSize: '0.82rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <Users size={14} />
                  <span>Manage Team</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    padding: '0.6rem 1rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '0.82rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. ADMIN SIDEBAR + WORKSPACE AREA */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Dedicated Admin Sidebar */}
        <aside
          style={{
            width: '260px',
            backgroundColor: theme.bgCard,
            borderRight: `1px solid ${theme.borderLight}`,
            padding: '1.5rem 0.95rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          {/* Section 1: Super Admin Governance */}
          <div style={{ padding: '0 0.6rem 0.6rem 0.6rem', borderBottom: `1px solid ${theme.borderLight}`, marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: theme.accentGold }}>
              👑 Super Admin Governance
            </span>
          </div>

          {adminGovernanceLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 500,
                  textDecoration: 'none',
                  color: isActive ? theme.accentGold : theme.textMuted,
                  backgroundColor: isActive ? theme.accentGoldSoft : 'transparent',
                  border: isActive ? `1px solid ${theme.accentGold}` : '1px solid transparent',
                  transition: 'all 140ms ease',
                })}
              >
                <Icon size={15} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}

          {/* Section 2: Accountant Operations & Ledgers */}
          <div style={{ padding: '0.8rem 0.6rem 0.6rem 0.6rem', borderBottom: `1px solid ${theme.borderLight}`, marginTop: '0.6rem', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#38bdf8' }}>
              💼 Accountant Operations &amp; Ledgers
            </span>
          </div>

          {erpAccountingLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 500,
                  textDecoration: 'none',
                  color: isActive ? '#38bdf8' : theme.textMuted,
                  backgroundColor: isActive ? '#0284c715' : 'transparent',
                  border: isActive ? `1px solid #38bdf8` : '1px solid transparent',
                  transition: 'all 140ms ease',
                })}
              >
                <Icon size={15} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </aside>

        {/* Main Content Pane */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
