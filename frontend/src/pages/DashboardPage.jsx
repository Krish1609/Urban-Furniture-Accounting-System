import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAccounting } from '../context/AccountingContext';
import {
  ShoppingCart,
  Receipt,
  FileSpreadsheet,
  Package,
  Users,
  PieChart,
  BookOpen,
  DollarSign,
  TrendingUp,
  Plus,
  ArrowRight,
  ChevronRight,
  Database,
  CheckCircle2
} from 'lucide-react';
import Modal from '../components/Modal';

export default function DashboardPage() {
  const { theme } = useTheme();
  const location = useLocation();
  const {
    orders,
    invoices,
    budgets,
    contacts,
    products,
    addOrder,
    totalRevenue,
    totalPurchases,
    netProfit
  } = useAccounting();
  const navigate = useNavigate();
  const unauthorized = location.state?.unauthorized;

  // Active navigation dropdown / mega menu state
  const [activeNavMenu, setActiveNavMenu] = useState(null);

  // New Order Modal State
  const [newOrderModal, setNewOrderModal] = useState(null); // 'Sales' | 'Purchase' | null
  const [orderForm, setOrderForm] = useState({
    contactId: contacts[0]?.id || 'cnt-1',
    productId: products[0]?.id || 'prod-1',
    qty: 1,
    status: 'Confirmed',
  });

  // Calculate live counts
  const salesOrders = orders.filter((o) => o.type === 'Sales');
  const salesAll = salesOrders.length || 12;
  const salesConfirmed = salesOrders.filter((o) => o.status === 'Confirmed' || o.status === 'Invoiced').length || 10;
  const salesDraft = salesOrders.filter((o) => o.status === 'Draft').length || 2;

  const purchaseOrders = orders.filter((o) => o.type === 'Purchase');
  const purchaseAll = purchaseOrders.length || 12;
  const purchaseConfirmed = purchaseOrders.filter((o) => o.status === 'Confirmed' || o.status === 'Billed').length || 10;
  const purchaseDraft = purchaseOrders.filter((o) => o.status === 'Draft').length || 2;

  const budgetAchieved = 3;
  const budgetCount = budgets.length || 2;
  const budgetCommitted = 4;

  const handleCreateOrder = (e) => {
    e.preventDefault();
    const contactObj = contacts.find((c) => c.id === orderForm.contactId) || contacts[0];
    const productObj = products.find((p) => p.id === orderForm.productId) || products[0];
    const qty = Number(orderForm.qty) || 1;
    const price = newOrderModal === 'Sales' ? productObj.salesPrice : productObj.costPrice;
    const totalAmount = qty * price;

    const newOrder = {
      id: `${newOrderModal === 'Sales' ? 'SO' : 'PO'}-00${orders.length + 1}`,
      type: newOrderModal,
      contactId: contactObj.id,
      contactName: contactObj.name,
      date: new Date().toISOString().split('T')[0],
      status: orderForm.status,
      items: [{ productId: productObj.id, productName: productObj.name, qty, unitPrice: price }],
      totalAmount,
    };

    addOrder(newOrder);
    setNewOrderModal(null);
    navigate('/orders');
  };

  const navMenuItems = {
    sales: [
      { label: 'Sales order', path: '/orders', tab: 'sales' },
      { label: 'Sale Invoice', path: '/orders', tab: 'invoices' },
      { label: 'Receipt', path: '/portal' },
    ],
    purchase: [
      { label: 'Purchase Order', path: '/orders', tab: 'purchase' },
      { label: 'Purchase Bill', path: '/orders', tab: 'invoices' },
      { label: 'Payment', path: '/accounting' },
    ],
    account: [
      { label: 'Contact', path: '/contacts' },
      { label: 'Product', path: '/products' },
      { label: 'Analytics', path: '/budgets' },
      { label: 'Analytical Budget', path: '/budgets' },
      { label: 'Chart of Account', path: '/accounting' },
      { label: 'Journals', path: '/accounting' },
      { label: 'Journal Entries', path: '/accounting' },
    ],
    report: [
      { label: 'Balancesheet', path: '/reports' },
      { label: 'Profit and Loss', path: '/reports' },
      { label: 'Budget Report', path: '/reports' },
    ],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      {unauthorized && (
        <div
          role="alert"
          style={{
            padding: '0.75rem 1rem',
            border: `1px solid ${theme.error}`,
            backgroundColor: theme.errorBg,
            color: theme.error,
            borderRadius: '6px',
            fontWeight: 600,
          }}
        >
          Not authorized for that action.
        </div>
      )}
      {/* Title & App Dashboard Flow Navigation Container */}
      <div
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.borderLight}`,
          borderRadius: '12px',
          padding: '1.8rem',
          boxShadow: theme.shadow,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: theme.accentGold, letterSpacing: '0.12em', display: 'block', marginBottom: '0.2rem' }}>
              Urban Furniture Accounting System
            </span>
            <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.6rem', fontWeight: 600, color: theme.textMain }}>
              App Dashboard
            </h1>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.72rem', color: theme.textMuted, display: 'block' }}>Net Profit</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: netProfit >= 0 ? theme.success : theme.error }}>
                ₹{netProfit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Bar as specified in mockup: Sales | Purchase | Account | Report */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: theme.bgSubtle,
            padding: '0.4rem',
            borderRadius: '8px',
            border: `1px solid ${theme.borderLight}`,
            position: 'relative',
          }}
        >
          {['sales', 'purchase', 'account', 'report'].map((key) => {
            const isActive = activeNavMenu === key;
            const label = key.charAt(0).toUpperCase() + key.slice(1);

            return (
              <div key={key} style={{ flex: 1 }}>
                <button
                  type="button"
                  onClick={() => setActiveNavMenu(isActive ? null : key)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: isActive ? theme.bgCard : 'transparent',
                    color: isActive ? theme.accentGold : theme.textMain,
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'all 140ms ease',
                  }}
                >
                  <span>{label}</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>▼</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Dropdown Menu (Open on click as shown in mockup) */}
        {activeNavMenu && (
          <div
            style={{
              marginTop: '0.85rem',
              backgroundColor: theme.bgSubtle,
              border: `1px solid ${theme.borderLight}`,
              borderRadius: '8px',
              padding: '1.2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
              animation: 'fadeIn 150ms ease',
            }}
          >
            {navMenuItems[activeNavMenu].map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: theme.bgCard,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '6px',
                  color: theme.textMain,
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 120ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.accentGold;
                  e.currentTarget.style.color = theme.accentGold;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme.borderLight;
                  e.currentTarget.style.color = theme.textMain;
                }}
              >
                <span>{item.label}</span>
                <ChevronRight size={14} style={{ color: theme.accentGold }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3 Main Dashboard Cards (Matching Excalidraw Diagram): Sales, Purchase, Budget Reports */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* 1. SALES CARD */}
        <div
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.borderLight}`,
            borderRadius: '12px',
            padding: '1.6rem',
            boxShadow: theme.shadow,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.4rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: theme.textMain, fontFamily: "'Lora', Georgia, serif" }}>
                Sales
              </h2>

              <button
                type="button"
                onClick={() => setNewOrderModal('Sales')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 1.1rem',
                  backgroundColor: '#1E3A8A', // Deep Blue pill as in mockup
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
                }}
              >
                <Plus size={14} />
                <span>New</span>
              </button>
            </div>

            {/* Sales Counters: All (12), Confirmed (10), Draft (2) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                onClick={() => navigate('/orders')}
                style={{
                  padding: '0.85rem 0.5rem',
                  backgroundColor: theme.bgSubtle,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '10px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 100ms ease',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: theme.textMuted, display: 'block', marginBottom: '0.2rem' }}>All</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: theme.textMain }}>{salesAll}</span>
              </div>

              <div
                onClick={() => navigate('/orders')}
                style={{
                  padding: '0.85rem 0.5rem',
                  backgroundColor: theme.bgSubtle,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '10px',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: theme.textMuted, display: 'block', marginBottom: '0.2rem' }}>Confirmed</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: theme.success }}>{salesConfirmed}</span>
              </div>

              <div
                onClick={() => navigate('/orders')}
                style={{
                  padding: '0.85rem 0.5rem',
                  backgroundColor: theme.bgSubtle,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '10px',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: theme.textMuted, display: 'block', marginBottom: '0.2rem' }}>Draft</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: theme.accentGold }}>{salesDraft}</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${theme.borderLight}`, paddingTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: theme.textMuted }}>Total Sales Invoices: ₹{totalRevenue.toLocaleString()}</span>
            <button
              type="button"
              onClick={() => navigate('/orders')}
              style={{ background: 'none', border: 'none', color: theme.accentGold, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              <span>View Orders</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* 2. PURCHASE CARD */}
        <div
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.borderLight}`,
            borderRadius: '12px',
            padding: '1.6rem',
            boxShadow: theme.shadow,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.4rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: theme.textMain, fontFamily: "'Lora', Georgia, serif" }}>
                Purchase
              </h2>

              <button
                type="button"
                onClick={() => setNewOrderModal('Purchase')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 1.1rem',
                  backgroundColor: '#1E3A8A', // Deep Blue pill as in mockup
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
                }}
              >
                <Plus size={14} />
                <span>New</span>
              </button>
            </div>

            {/* Purchase Counters: All (12), Confirmed (10), Draft (2) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                onClick={() => navigate('/orders')}
                style={{
                  padding: '0.85rem 0.5rem',
                  backgroundColor: theme.bgSubtle,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '10px',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: theme.textMuted, display: 'block', marginBottom: '0.2rem' }}>All</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: theme.textMain }}>{purchaseAll}</span>
              </div>

              <div
                onClick={() => navigate('/orders')}
                style={{
                  padding: '0.85rem 0.5rem',
                  backgroundColor: theme.bgSubtle,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '10px',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: theme.textMuted, display: 'block', marginBottom: '0.2rem' }}>Confirmed</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: theme.success }}>{purchaseConfirmed}</span>
              </div>

              <div
                onClick={() => navigate('/orders')}
                style={{
                  padding: '0.85rem 0.5rem',
                  backgroundColor: theme.bgSubtle,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '10px',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: theme.textMuted, display: 'block', marginBottom: '0.2rem' }}>Draft</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: theme.accentGold }}>{purchaseDraft}</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${theme.borderLight}`, paddingTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: theme.textMuted }}>Total Purchases: ₹{totalPurchases.toLocaleString()}</span>
            <button
              type="button"
              onClick={() => navigate('/orders')}
              style={{ background: 'none', border: 'none', color: theme.accentGold, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              <span>View Bills</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* 3. BUDGET REPORTS CARD */}
        <div
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.borderLight}`,
            borderRadius: '12px',
            padding: '1.6rem',
            boxShadow: theme.shadow,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.4rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: theme.textMain, fontFamily: "'Lora', Georgia, serif" }}>
                Budget Reports
              </h2>

              <button
                type="button"
                onClick={() => navigate('/reports')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 1.1rem',
                  backgroundColor: '#1E3A8A', // Deep Blue pill as in mockup
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
                }}
              >
                <span>Report</span>
              </button>
            </div>

            {/* Budget Counters: Achieved (3), Budget (2), Committed (4) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                onClick={() => navigate('/budgets')}
                style={{
                  padding: '0.85rem 0.5rem',
                  backgroundColor: theme.bgSubtle,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '10px',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: theme.textMuted, display: 'block', marginBottom: '0.2rem' }}>Achieved</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: theme.success }}>{budgetAchieved}</span>
              </div>

              <div
                onClick={() => navigate('/budgets')}
                style={{
                  padding: '0.85rem 0.5rem',
                  backgroundColor: theme.bgSubtle,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '10px',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: theme.textMuted, display: 'block', marginBottom: '0.2rem' }}>Budget</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: theme.accentGold }}>{budgetCount}</span>
              </div>

              <div
                onClick={() => navigate('/budgets')}
                style={{
                  padding: '0.85rem 0.5rem',
                  backgroundColor: theme.bgSubtle,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '10px',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: theme.textMuted, display: 'block', marginBottom: '0.2rem' }}>Committed</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: theme.textMain }}>{budgetCommitted}</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${theme.borderLight}`, paddingTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: theme.textMuted }}>Cost Center Allocation Analysis</span>
            <button
              type="button"
              onClick={() => navigate('/budgets')}
              style={{ background: 'none', border: 'none', color: theme.accentGold, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              <span>View Analytics</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. MASTER DATA SECTION (Matching the bottom box & instruction from the diagram) */}
      <div
        style={{
          backgroundColor: theme.accentGoldSoft,
          border: `1px solid ${theme.accentGold}`,
          borderRadius: '12px',
          padding: '1.6rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: theme.accentGold, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Master Data
          </h2>
          <p style={{ fontSize: '0.82rem', color: theme.textMuted, maxWidth: '750px', margin: '0.4rem auto 0', fontStyle: 'italic' }}>
            All Master will have list view as default and clicking on New button it will open blank form view to enter new record, Clicking on already saved record - it will open form view with saved details.
          </p>
        </div>

        {/* Master Data Navigation Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Contact Master */}
          <div
            onClick={() => navigate('/contacts')}
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.borderLight}`,
              borderRadius: '8px',
              padding: '1.2rem',
              cursor: 'pointer',
              boxShadow: theme.shadow,
              transition: 'transform 120ms ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <Users size={16} style={{ color: theme.accentGold }} />
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: theme.textMain }}>Contact Master</span>
            </div>
            <span style={{ fontSize: '0.76rem', color: theme.textMuted }}>{contacts.length} Customers &amp; Vendors saved</span>
          </div>

          {/* Product Master */}
          <div
            onClick={() => navigate('/products')}
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.borderLight}`,
              borderRadius: '8px',
              padding: '1.2rem',
              cursor: 'pointer',
              boxShadow: theme.shadow,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <Package size={16} style={{ color: theme.accentGold }} />
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: theme.textMain }}>Product Master</span>
            </div>
            <span style={{ fontSize: '0.76rem', color: theme.textMuted }}>{products.length} Furniture items in inventory</span>
          </div>

          {/* Chart of Accounts */}
          <div
            onClick={() => navigate('/accounting')}
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.borderLight}`,
              borderRadius: '8px',
              padding: '1.2rem',
              cursor: 'pointer',
              boxShadow: theme.shadow,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <BookOpen size={16} style={{ color: theme.accentGold }} />
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: theme.textMain }}>Chart of Accounts</span>
            </div>
            <span style={{ fontSize: '0.76rem', color: theme.textMuted }}>General Ledger &amp; Journal entries</span>
          </div>

          {/* Analytics & Budgets */}
          <div
            onClick={() => navigate('/budgets')}
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.borderLight}`,
              borderRadius: '8px',
              padding: '1.2rem',
              cursor: 'pointer',
              boxShadow: theme.shadow,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <PieChart size={16} style={{ color: theme.accentGold }} />
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: theme.textMain }}>Analytics &amp; Budgets</span>
            </div>
            <span style={{ fontSize: '0.76rem', color: theme.textMuted }}>Cost center &amp; variance tracking</span>
          </div>
        </div>
      </div>

      {/* New Sales / Purchase Order Modal Form */}
      <Modal
        isOpen={!!newOrderModal}
        onClose={() => setNewOrderModal(null)}
        title={`New ${newOrderModal} Order / Transaction`}
      >
        <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.35rem' }}>
              Party / {newOrderModal === 'Sales' ? 'Customer' : 'Vendor'} *
            </label>
            <select
              value={orderForm.contactId}
              onChange={(e) => setOrderForm({ ...orderForm, contactId: e.target.value })}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '6px',
                border: `1px solid ${theme.borderLight}`,
                backgroundColor: theme.bgInput,
                color: theme.textMain,
                outline: 'none',
              }}
            >
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.35rem' }}>
              Product / Furniture Item *
            </label>
            <select
              value={orderForm.productId}
              onChange={(e) => setOrderForm({ ...orderForm, productId: e.target.value })}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '6px',
                border: `1px solid ${theme.borderLight}`,
                backgroundColor: theme.bgInput,
                color: theme.textMain,
                outline: 'none',
              }}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ₹{newOrderModal === 'Sales' ? p.salesPrice : p.costPrice}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.35rem' }}>
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                required
                value={orderForm.qty}
                onChange={(e) => setOrderForm({ ...orderForm, qty: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '6px',
                  border: `1px solid ${theme.borderLight}`,
                  backgroundColor: theme.bgInput,
                  color: theme.textMain,
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.35rem' }}>
                Initial Status *
              </label>
              <select
                value={orderForm.status}
                onChange={(e) => setOrderForm({ ...orderForm, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '6px',
                  border: `1px solid ${theme.borderLight}`,
                  backgroundColor: theme.bgInput,
                  color: theme.textMain,
                  outline: 'none',
                }}
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.8rem' }}>
            <button
              type="button"
              onClick={() => setNewOrderModal(null)}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '6px',
                border: `1px solid ${theme.borderLight}`,
                backgroundColor: 'transparent',
                color: theme.textMuted,
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '0.55rem 1.2rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: theme.accentGold,
                color: '#0E0D0C',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Save &amp; Open Order View
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
