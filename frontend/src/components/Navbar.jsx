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
  TrendingUp,
  LayoutGrid,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function Navbar() {
  const { theme, themeMode, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);

  // Active Category Dropdown state ('sales' | 'purchase' | 'account' | 'report' | 'admin' | 'all' | null)
  const [activeCategory, setActiveCategory] = useState(null);
  const hoverTimeoutRef = useRef(null);

  const currentRole = currentUser?.role || 'Administrator';

  // Clear hover debounce timer
  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  // Hover into a specific category (opens ONLY that category's dropdown smoothly)
  const handleMouseEnterCategory = (categoryId) => {
    clearHoverTimeout();
    setActiveCategory(categoryId);
  };

  // Hover out with silky 200ms grace window
  const handleMouseLeaveNav = () => {
    clearHoverTimeout();
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 200);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        clearHoverTimeout();
        setActiveCategory(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearHoverTimeout();
    };
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    clearHoverTimeout();
    setActiveCategory(null);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = (categoryId) => {
    clearHoverTimeout();
    setActiveCategory(prev => prev === categoryId ? null : categoryId);
  };

  // 4 Core Navigation Columns exactly matching flowchart
  const navCategories = [
    {
      id: 'sales',
      label: 'Sales',
      badge: 'Revenue',
      items: [
        { label: 'Sales order', path: '/orders', state: { tab: 'sales' }, icon: ShoppingCart },
        { label: 'Sale Invoice', path: '/orders', state: { tab: 'invoices', filterType: 'Customer Invoice' }, icon: Receipt },
        { label: 'Receipt', path: '/portal', icon: FileSpreadsheet },
      ],
    },
    {
      id: 'purchase',
      label: 'Purchase',
      badge: 'Procure',
      items: [
        { label: 'Purchase Order', path: '/orders', state: { tab: 'purchase' }, icon: ShoppingCart },
        { label: 'Purchase Bill', path: '/orders', state: { tab: 'invoices', filterType: 'Vendor Bill' }, icon: Receipt },
        { label: 'Payment', path: '/accounting', state: { tab: 'journals' }, icon: DollarSign },
      ],
    },
    {
      id: 'account',
      label: 'Account',
      badge: 'Ledger',
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
      badge: 'Insights',
      items: [
        { label: 'Balancesheet', path: '/reports', state: { report: 'bs' }, icon: FileSpreadsheet },
        { label: 'Profit and Loss', path: '/reports', state: { report: 'pl' }, icon: TrendingUp },
        { label: 'Budget Report', path: '/budgets', state: { tab: 'budgets' }, icon: PieChart },
      ],
    },
    ...(currentRole === 'Administrator' ? [{
      id: 'admin',
      label: 'Admin',
      badge: 'Controls',
      items: [
        { label: 'User Management', path: '/users', icon: ShieldCheck },
        { label: 'Create New User', path: '/create-user', icon: Users },
      ],
    }] : []),
  ];

  return (
    <>
      {/* Dynamic Keyframes for Silky Smooth Transitions */}
      <style>{`
        @keyframes navDropdownSlideDown {
          0% {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes navMegaMatrixSlideDown {
          0% {
            opacity: 0;
            transform: translateY(-10px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .nav-item-btn {
          position: relative;
          transition: all 180ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-item-btn:hover {
          transform: translateY(-1px);
        }
        .nav-dropdown-item {
          transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-dropdown-item:hover {
          transform: translateX(4px);
        }
      `}</style>

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
          zIndex: 100,
          boxShadow: '0 2px 14px rgba(0, 0, 0, 0.08)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Left: Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to={currentRole === 'User' ? '/portal' : '/dashboard'} style={{ textDecoration: 'none' }}>
            <Logo theme={theme} isSmall />
          </Link>

          {/* Center: Top Navigation Bar - Individual Smooth Hover Dropdowns */}
          {(currentRole === 'Administrator' || currentRole === 'Accountant') && (
            <nav
              onMouseLeave={handleMouseLeaveNav}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', position: 'relative' }}
            >
              {navCategories.map((cat) => {
                const isOpen = activeCategory === cat.id;

                return (
                  <div
                    key={cat.id}
                    style={{ position: 'relative' }}
                    onMouseEnter={() => handleMouseEnterCategory(cat.id)}
                    onMouseLeave={handleMouseLeaveNav}
                  >
                    {/* Category Trigger Button */}
                    <button
                      type="button"
                      className="nav-item-btn"
                      onClick={() => handleNavClick(cat.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.52rem 0.95rem',
                        borderRadius: '7px',
                        fontSize: '0.86rem',
                        fontWeight: 600,
                        backgroundColor: isOpen ? theme.bgSubtle : 'transparent',
                        color: isOpen ? theme.accentGold : theme.textMain,
                        border: isOpen ? `1px solid ${theme.borderLight}` : '1px solid transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span>{cat.label}</span>
                      <ChevronDown
                        size={14}
                        style={{
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                          transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                          color: isOpen ? theme.accentGold : theme.textMuted,
                        }}
                      />
                    </button>

                    {/* ONLY THIS CATEGORY'S INDIVIDUAL DROPDOWN OPENS */}
                    {isOpen && (
                      <div
                        onMouseEnter={clearHoverTimeout}
                        onMouseLeave={handleMouseLeaveNav}
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          paddingTop: '6px', // Invisible bridge to avoid cursor exit gap
                          zIndex: 250,
                          animation: 'navDropdownSlideDown 160ms cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      >
                        <div
                          style={{
                            minWidth: cat.id === 'account' ? '255px' : '230px',
                            backgroundColor: theme.bgCard,
                            border: `1px solid ${theme.borderLight}`,
                            borderTop: `2px solid ${theme.accentGold}`,
                            borderRadius: '10px',
                            padding: '0.55rem',
                            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.38), 0 0 0 1px rgba(212, 175, 55, 0.12)',
                            backdropFilter: 'blur(16px)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.2rem',
                          }}
                        >
                          {/* Dropdown Header Badge */}
                          <div
                            style={{
                              padding: '0.4rem 0.65rem 0.45rem',
                              borderBottom: `1px solid ${theme.borderLight}`,
                              marginBottom: '0.3rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.07em',
                                color: theme.accentGold,
                                fontFamily: "'Lora', Georgia, serif",
                              }}
                            >
                              {cat.label}
                            </span>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '12px',
                                backgroundColor: theme.accentGoldSoft,
                                color: theme.accentGold,
                                fontWeight: 600,
                              }}
                            >
                              {cat.badge}
                            </span>
                          </div>

                          {/* Dropdown Items */}
                          {cat.items.map((item, idx) => {
                            const Icon = item.icon;
                            const isCurrentPath = location.pathname === item.path;

                            return (
                              <button
                                key={idx}
                                type="button"
                                className="nav-dropdown-item"
                                onClick={() => {
                                  clearHoverTimeout();
                                  setActiveCategory(null);
                                  navigate(item.path, { state: item.state });
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.65rem',
                                  padding: '0.55rem 0.75rem',
                                  borderRadius: '6px',
                                  fontSize: '0.84rem',
                                  fontWeight: isCurrentPath ? 600 : 500,
                                  color: isCurrentPath ? theme.accentGold : theme.textMain,
                                  backgroundColor: isCurrentPath ? theme.bgSubtle : 'transparent',
                                  border: 'none',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  width: '100%',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = theme.bgSubtle;
                                  e.currentTarget.style.color = theme.accentGold;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = isCurrentPath ? theme.bgSubtle : 'transparent';
                                  e.currentTarget.style.color = isCurrentPath ? theme.accentGold : theme.textMain;
                                }}
                              >
                                <Icon size={15} style={{ color: theme.accentGold, flexShrink: 0 }} />
                                <span style={{ flex: 1 }}>{item.label}</span>
                                {isCurrentPath && (
                                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: theme.accentGold }} />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* All Modules Quick Button & Full Overview Dropdown */}
              <div
                style={{ position: 'relative' }}
                onMouseEnter={() => handleMouseEnterCategory('all')}
                onMouseLeave={handleMouseLeaveNav}
              >
                <button
                  type="button"
                  className="nav-item-btn"
                  onClick={() => handleNavClick('all')}
                  title="Open All Modules Overview"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.52rem 0.85rem',
                    borderRadius: '7px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    backgroundColor: activeCategory === 'all' ? theme.accentGoldSoft : 'transparent',
                    color: activeCategory === 'all' ? theme.accentGold : theme.textMuted,
                    border: `1px solid ${activeCategory === 'all' ? theme.accentGold : theme.borderLight}`,
                    cursor: 'pointer',
                    marginLeft: '0.35rem',
                  }}
                >
                  <LayoutGrid size={14} />
                  <span>All Modules</span>
                </button>

                {/* Mega Matrix (Only when hovering/clicking 'All Modules') */}
                {activeCategory === 'all' && (
                  <div
                    onMouseEnter={clearHoverTimeout}
                    onMouseLeave={handleMouseLeaveNav}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      paddingTop: '6px', // Invisible bridge to avoid cursor exit gap
                      zIndex: 250,
                      animation: 'navMegaMatrixSlideDown 180ms cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    <div
                      style={{
                        width: '820px',
                        maxWidth: '90vw',
                        backgroundColor: theme.bgCard,
                        border: `1px solid ${theme.borderLight}`,
                        borderTop: `2px solid ${theme.accentGold}`,
                        borderRadius: '12px',
                        padding: '1.3rem 1.5rem',
                        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(212, 175, 55, 0.12)',
                        backdropFilter: 'blur(16px)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '1.2rem',
                      }}
                    >
                      {navCategories.map((col) => (
                        <div key={col.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <div
                            style={{
                              paddingBottom: '0.4rem',
                              marginBottom: '0.25rem',
                              borderBottom: `2px solid ${theme.accentGold}`,
                              fontSize: '0.9rem',
                              fontWeight: 700,
                              color: theme.accentGold,
                              fontFamily: "'Lora', Georgia, serif",
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span>{col.label}</span>
                            <span style={{ fontSize: '0.66rem', color: theme.textMuted, fontWeight: 500 }}>{col.badge}</span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            {col.items.map((item, idx) => {
                              const Icon = item.icon;
                              const isCurrent = location.pathname === item.path;

                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  className="nav-dropdown-item"
                                  onClick={() => {
                                    clearHoverTimeout();
                                    setActiveCategory(null);
                                    navigate(item.path, { state: item.state });
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.48rem 0.55rem',
                                    borderRadius: '5px',
                                    fontSize: '0.8rem',
                                    fontWeight: isCurrent ? 600 : 500,
                                    color: isCurrent ? theme.accentGold : theme.textMain,
                                    backgroundColor: isCurrent ? theme.bgSubtle : 'transparent',
                                    border: 'none',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    width: '100%',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = theme.bgSubtle;
                                    e.currentTarget.style.color = theme.accentGold;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = isCurrent ? theme.bgSubtle : 'transparent';
                                    e.currentTarget.style.color = isCurrent ? theme.accentGold : theme.textMain;
                                  }}
                                >
                                  <Icon size={14} style={{ color: theme.accentGold, flexShrink: 0 }} />
                                  <span>{item.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>
          )}

          {/* User Portal Link for Regular Users */}
          {currentRole === 'User' && (
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: theme.accentGold }}>
              Client &amp; Vendor Self-Service Portal
            </span>
          )}
        </div>

        {/* Right Controls: Role, Theme, Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Super Admin Console Jump (Administrator Only) */}
          {currentRole === 'Administrator' && (
            <button
              type="button"
              onClick={() => navigate('/admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.42rem 0.85rem',
                backgroundColor: theme.accentGoldSoft,
                border: `1px solid ${theme.accentGold}`,
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: theme.accentGold,
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
            >
              <ShieldCheck size={14} />
              <span>👑 Super Admin Console</span>
            </button>
          )}

          {/* User Identity & Role Badge */}
          <div
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
            }}
          >
            {currentRole === 'Administrator' ? <ShieldCheck size={14} /> : <UserIcon size={14} />}
            <span>{currentRole}: {currentUser?.name || currentUser?.loginId || 'User'}</span>
          </div>

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
    </>
  );
}
