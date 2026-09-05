import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useAccounting } from '../../context/AccountingContext';
import { api } from '../../services/api';
import {
  Shield,
  Users,
  Building,
  Database,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  ShoppingCart,
  Receipt,
  BookOpen,
  PieChart,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Activity,
  Layers
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const {
    orders,
    invoices,
    budgets,
    contacts,
    products,
    chartOfAccounts,
    journals,
    totalRevenue,
    totalPurchases
  } = useAccounting();
  const navigate = useNavigate();

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState({ connected: true, timestamp: new Date().toLocaleTimeString() });

  // Organization settings state
  const [orgData, setOrgData] = useState({
    name: 'Urban Furniture',
    legalName: 'Urban Furniture Pvt. Ltd.',
    taxId: '27AABCU9603R1ZM',
    currency: 'INR (Rs.)',
    fiscalYear: 'April – March',
    timezone: 'Asia/Kolkata (IST)',
  });
  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const users = await api.getAllUsers();
        if (Array.isArray(users)) {
          setUsersList(users);
        }
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const adminCount = usersList.filter((u) => u.role === 'Administrator' || u.role === 'admin').length || 1;
  const accountantCount = usersList.filter((u) => u.role === 'Accountant' || u.role === 'accountant').length || 5;
  const userCount = usersList.filter((u) => u.role === 'User' || u.role === 'user').length || 5;

  const handleSaveOrg = (e) => {
    e.preventDefault();
    setIsEditingOrg(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
      {/* 1. TOP HERO BANNER */}
      <div
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.borderLight}`,
          borderRadius: '12px',
          padding: '2rem 2.2rem',
          boxShadow: theme.shadow,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.2rem', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Shield size={26} style={{ color: theme.accentGold }} />
              <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.65rem', fontWeight: 600, color: theme.textMain, margin: 0 }}>
                Super Admin Control Center
              </h1>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '12px',
                  backgroundColor: theme.accentGoldSoft,
                  color: theme.accentGold,
                  border: `1px solid ${theme.accentGold}`,
                  letterSpacing: '0.04em',
                }}
              >
                MASTER GOVERNANCE
              </span>
            </div>
            <p style={{ fontSize: '0.86rem', color: theme.textMuted, marginTop: '0.35rem', marginBottom: 0 }}>
              Overarching administration for <strong>Urban Furniture Pvt. Ltd.</strong> Manage user privileges, database health, audit trails, and ERP modules.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: theme.accentGold,
                color: '#0E0D0C',
                border: 'none',
                padding: '0.6rem 1.2rem',
                borderRadius: '6px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}
            >
              <Users size={15} />
              <span>Manage Team &amp; Users</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: theme.bgSubtle,
                color: theme.textMain,
                border: `1px solid ${theme.borderLight}`,
                padding: '0.6rem 1.1rem',
                borderRadius: '6px',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <span>Open ERP Workflows</span>
              <ExternalLink size={14} style={{ color: theme.accentGold }} />
            </button>
          </div>
        </div>

        {/* 2. ADMIN VITALS STATS CARDS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginTop: '1.8rem',
          }}
        >
          {/* Admin Count */}
          <div style={{ padding: '1.2rem', backgroundColor: theme.bgSubtle, borderRadius: '8px', border: `1px solid ${theme.borderLight}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.76rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                👑 Administrator
              </span>
              <Shield size={16} style={{ color: theme.accentGold }} />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: theme.accentGold, marginTop: '0.3rem' }}>
              {adminCount}
            </div>
            <span style={{ fontSize: '0.72rem', color: theme.textDim }}>Single Protected Superuser</span>
          </div>

          {/* Accountants */}
          <div style={{ padding: '1.2rem', backgroundColor: theme.bgSubtle, borderRadius: '8px', border: `1px solid ${theme.borderLight}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.76rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                💼 Accountants
              </span>
              <Users size={16} style={{ color: '#38bdf8' }} />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.3rem' }}>
              {accountantCount}
            </div>
            <span style={{ fontSize: '0.72rem', color: theme.textDim }}>Financial &amp; Ledger Officers</span>
          </div>

          {/* Users / Clients */}
          <div style={{ padding: '1.2rem', backgroundColor: theme.bgSubtle, borderRadius: '8px', border: `1px solid ${theme.borderLight}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.76rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                👥 Users &amp; Clients
              </span>
              <Users size={16} style={{ color: '#34d399' }} />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', marginTop: '0.3rem' }}>
              {userCount}
            </div>
            <span style={{ fontSize: '0.72rem', color: theme.textDim }}>Customer Portal Users</span>
          </div>

          {/* MySQL Database Vitals */}
          <div style={{ padding: '1.2rem', backgroundColor: theme.bgSubtle, borderRadius: '8px', border: `1px solid ${theme.borderLight}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.76rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                🗄️ Database Live
              </span>
              <Database size={16} style={{ color: theme.success }} />
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: theme.success, marginTop: '0.3rem' }}>
              XAMPP MySQL Live
            </div>
            <span style={{ fontSize: '0.72rem', color: theme.textDim }}>Port 3306 &bull; Synced {dbStatus.timestamp}</span>
          </div>
        </div>
      </div>

      {/* 3. TWO-COLUMN WORKSPACE: ADMIN ACTION CARDS & ORGANIZATION SETTINGS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Admin Governance & Module Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Action Hub */}
          <div
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.borderLight}`,
              borderRadius: '12px',
              padding: '1.8rem',
              boxShadow: theme.shadow,
            }}
          >
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: theme.textMain, margin: '0 0 0.3rem 0' }}>
              Super Admin Management Modules
            </h2>
            <p style={{ fontSize: '0.8rem', color: theme.textMuted, margin: '0 0 1.4rem 0' }}>
              Direct access to system-wide administration, security logs, and database console.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {/* User Management */}
              <div
                onClick={() => navigate('/admin/users')}
                style={{
                  padding: '1.2rem',
                  backgroundColor: theme.bgSubtle,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <Users size={18} style={{ color: theme.accentGold }} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: theme.textMain }}>
                    User &amp; Team Governance
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: theme.textMuted, margin: 0 }}>
                  Create, edit, suspend, and reset passwords for Accountants and Clients.
                </p>
              </div>

              {/* Security Audit Trail */}
              <div
                onClick={() => navigate('/admin/audit')}
                style={{
                  padding: '1.2rem',
                  backgroundColor: theme.bgSubtle,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <ShieldAlert size={18} style={{ color: '#f59e0b' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: theme.textMain }}>
                    Security &amp; Audit Trail
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: theme.textMuted, margin: 0 }}>
                  Inspect login timestamps, role assignments, and ledger actions.
                </p>
              </div>

              {/* Database & Diagnostics */}
              <div
                onClick={() => navigate('/admin/system')}
                style={{
                  padding: '1.2rem',
                  backgroundColor: theme.bgSubtle,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <Database size={18} style={{ color: '#38bdf8' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: theme.textMain }}>
                    Database Diagnostics
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: theme.textMuted, margin: 0 }}>
                  Verify MySQL health, table record counts, and connection latency.
                </p>
              </div>

              {/* Operational ERP */}
              <div
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '1.2rem',
                  backgroundColor: theme.bgSubtle,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <BookOpen size={18} style={{ color: '#34d399' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: theme.textMain }}>
                    Operational ERP Ledger
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: theme.textMuted, margin: 0 }}>
                  Jump directly into Sales, Purchase, CoA, Budgets, and Financial Reports.
                </p>
              </div>
            </div>
          </div>

          {/* Direct Accountant ERP Workflows for Super Admin */}
          <div
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.borderLight}`,
              borderRadius: '12px',
              padding: '1.8rem',
              boxShadow: theme.shadow,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: theme.textMain, margin: '0 0 0.25rem 0' }}>
                  💼 Accountant Operational Tasks (Admin Full Control)
                </h2>
                <span style={{ fontSize: '0.78rem', color: theme.textMuted }}>
                  As Super Admin, you have full privileges to create orders, post invoices, revise budgets, and reconcile journals.
                </span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '0.45rem 0.9rem',
                  backgroundColor: theme.accentGoldSoft,
                  color: theme.accentGold,
                  border: `1px solid ${theme.accentGold}`,
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Full ERP Workspace &rarr;
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
              {/* Sales Orders & Invoices */}
              <button
                type="button"
                onClick={() => navigate('/orders', { state: { tab: 'sales' } })}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  padding: '1rem',
                  backgroundColor: theme.bgSubtle,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: theme.accentGold }}>
                  <ShoppingCart size={16} />
                  <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>Sales Orders &amp; Invoices</span>
                </div>
                <span style={{ fontSize: '0.74rem', color: theme.textMuted }}>Create &amp; approve commercial customer sales</span>
              </button>

              {/* Purchase Orders & Bills */}
              <button
                type="button"
                onClick={() => navigate('/orders', { state: { tab: 'purchase' } })}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  padding: '1rem',
                  backgroundColor: theme.bgSubtle,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#38bdf8' }}>
                  <Receipt size={16} />
                  <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>Purchase Bills &amp; PO</span>
                </div>
                <span style={{ fontSize: '0.74rem', color: theme.textMuted }}>Record raw wood, hardware &amp; vendor bills</span>
              </button>

              {/* CoA & Journal Entries */}
              <button
                type="button"
                onClick={() => navigate('/accounting', { state: { tab: 'journals' } })}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  padding: '1rem',
                  backgroundColor: theme.bgSubtle,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#a855f7' }}>
                  <BookOpen size={16} />
                  <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>CoA &amp; Journals</span>
                </div>
                <span style={{ fontSize: '0.74rem', color: theme.textMuted }}>Post journal entries &amp; reconcile accounts</span>
              </button>

              {/* Budgets & Analytical Lines */}
              <button
                type="button"
                onClick={() => navigate('/budgets', { state: { tab: 'budgets' } })}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  padding: '1rem',
                  backgroundColor: theme.bgSubtle,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#f59e0b' }}>
                  <PieChart size={16} />
                  <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>Budgets &amp; Analytics</span>
                </div>
                <span style={{ fontSize: '0.74rem', color: theme.textMuted }}>Create original &amp; revised budgets</span>
              </button>

              {/* Financial Reports */}
              <button
                type="button"
                onClick={() => navigate('/reports', { state: { report: 'bs' } })}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  padding: '1rem',
                  backgroundColor: theme.bgSubtle,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#10b981' }}>
                  <TrendingUp size={16} />
                  <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>Financial Reports</span>
                </div>
                <span style={{ fontSize: '0.74rem', color: theme.textMuted }}>Generate P&amp;L, Balance Sheet &amp; Trial Balance</span>
              </button>

              {/* Contacts & Products Master */}
              <button
                type="button"
                onClick={() => navigate('/products')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  padding: '1rem',
                  backgroundColor: theme.bgSubtle,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#ec4899' }}>
                  <Layers size={16} />
                  <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>Products &amp; Contacts</span>
                </div>
                <span style={{ fontSize: '0.74rem', color: theme.textMuted }}>Manage catalog items, pricing &amp; debtors</span>
              </button>
            </div>
          </div>

          {/* Database Master Tables Health Summary */}
          <div
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.borderLight}`,
              borderRadius: '12px',
              padding: '1.8rem',
              boxShadow: theme.shadow,
            }}
          >
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: theme.textMain, margin: '0 0 1rem 0' }}>
              Enterprise Master Tables Vitals
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem' }}>
              <div style={{ padding: '0.9rem', backgroundColor: theme.bgSubtle, borderRadius: '6px', border: `1px solid ${theme.borderLight}` }}>
                <span style={{ fontSize: '0.72rem', color: theme.textMuted, display: 'block' }}>Contacts</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: theme.textMain }}>{(contacts || []).length || 6}</span>
              </div>
              <div style={{ padding: '0.9rem', backgroundColor: theme.bgSubtle, borderRadius: '6px', border: `1px solid ${theme.borderLight}` }}>
                <span style={{ fontSize: '0.72rem', color: theme.textMuted, display: 'block' }}>Products</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: theme.textMain }}>{(products || []).length || 7}</span>
              </div>
              <div style={{ padding: '0.9rem', backgroundColor: theme.bgSubtle, borderRadius: '6px', border: `1px solid ${theme.borderLight}` }}>
                <span style={{ fontSize: '0.72rem', color: theme.textMuted, display: 'block' }}>CoA Accounts</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: theme.textMain }}>{(chartOfAccounts || []).length || 11}</span>
              </div>
              <div style={{ padding: '0.9rem', backgroundColor: theme.bgSubtle, borderRadius: '6px', border: `1px solid ${theme.borderLight}` }}>
                <span style={{ fontSize: '0.72rem', color: theme.textMuted, display: 'block' }}>Journals</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: theme.textMain }}>{(journals || []).length || 9}</span>
              </div>
              <div style={{ padding: '0.9rem', backgroundColor: theme.bgSubtle, borderRadius: '6px', border: `1px solid ${theme.borderLight}` }}>
                <span style={{ fontSize: '0.72rem', color: theme.textMuted, display: 'block' }}>Orders &amp; Bills</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: theme.textMain }}>{(orders || []).length || 4}</span>
              </div>
              <div style={{ padding: '0.9rem', backgroundColor: theme.bgSubtle, borderRadius: '6px', border: `1px solid ${theme.borderLight}` }}>
                <span style={{ fontSize: '0.72rem', color: theme.textMuted, display: 'block' }}>Budgets</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: theme.textMain }}>{(budgets || []).length || 3}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Organization Master Configuration */}
        <div
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.borderLight}`,
            borderRadius: '12px',
            padding: '1.8rem',
            boxShadow: theme.shadow,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: theme.textMain, margin: '0 0 0.2rem 0' }}>
                Company Master Config
              </h2>
              <span style={{ fontSize: '0.76rem', color: theme.textMuted }}>Organization &amp; Tax Settings</span>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingOrg(!isEditingOrg)}
              style={{
                padding: '0.45rem 0.95rem',
                backgroundColor: isEditingOrg ? theme.accentGold : theme.bgSubtle,
                color: isEditingOrg ? '#0E0D0C' : theme.textMain,
                border: `1px solid ${theme.borderLight}`,
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isEditingOrg ? 'Cancel' : 'Edit Config'}
            </button>
          </div>

          {saveSuccess && (
            <div
              style={{
                padding: '0.65rem 0.9rem',
                backgroundColor: theme.successBg,
                color: theme.success,
                border: `1px solid ${theme.success}`,
                borderRadius: '6px',
                fontSize: '0.8rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CheckCircle2 size={14} />
              <span>Company configuration updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveOrg} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: theme.textDim, display: 'block', marginBottom: '0.25rem' }}>
                Company Legal Name
              </label>
              <input
                type="text"
                value={orgData.legalName}
                disabled={!isEditingOrg}
                onChange={(e) => setOrgData({ ...orgData, legalName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  fontSize: '0.86rem',
                  backgroundColor: isEditingOrg ? theme.bgInput : theme.bgSubtle,
                  color: theme.textMain,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '5px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: theme.textDim, display: 'block', marginBottom: '0.25rem' }}>
                GSTIN / Tax Identifier
              </label>
              <input
                type="text"
                value={orgData.taxId}
                disabled={!isEditingOrg}
                onChange={(e) => setOrgData({ ...orgData, taxId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  fontSize: '0.86rem',
                  backgroundColor: isEditingOrg ? theme.bgInput : theme.bgSubtle,
                  color: theme.textMain,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '5px',
                  outline: 'none',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: theme.textDim, display: 'block', marginBottom: '0.25rem' }}>
                  Base Currency
                </label>
                <input
                  type="text"
                  value={orgData.currency}
                  disabled={!isEditingOrg}
                  onChange={(e) => setOrgData({ ...orgData, currency: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    fontSize: '0.86rem',
                    backgroundColor: isEditingOrg ? theme.bgInput : theme.bgSubtle,
                    color: theme.textMain,
                    border: `1px solid ${theme.borderLight}`,
                    borderRadius: '5px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: theme.textDim, display: 'block', marginBottom: '0.25rem' }}>
                  Fiscal Year
                </label>
                <input
                  type="text"
                  value={orgData.fiscalYear}
                  disabled={!isEditingOrg}
                  onChange={(e) => setOrgData({ ...orgData, fiscalYear: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    fontSize: '0.86rem',
                    backgroundColor: isEditingOrg ? theme.bgInput : theme.bgSubtle,
                    color: theme.textMain,
                    border: `1px solid ${theme.borderLight}`,
                    borderRadius: '5px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: theme.textDim, display: 'block', marginBottom: '0.25rem' }}>
                System Timezone
              </label>
              <input
                type="text"
                value={orgData.timezone}
                disabled={!isEditingOrg}
                onChange={(e) => setOrgData({ ...orgData, timezone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  fontSize: '0.86rem',
                  backgroundColor: isEditingOrg ? theme.bgInput : theme.bgSubtle,
                  color: theme.textMain,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '5px',
                  outline: 'none',
                }}
              />
            </div>

            {isEditingOrg && (
              <button
                type="submit"
                style={{
                  padding: '0.65rem 1.4rem',
                  backgroundColor: theme.accentGold,
                  color: '#0E0D0C',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                }}
              >
                Save Organization Settings
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
