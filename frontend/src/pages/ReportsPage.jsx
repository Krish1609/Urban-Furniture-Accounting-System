import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAccounting } from '../context/AccountingContext';
import { FileText, Download, Printer, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';
import StatCard from '../components/StatCard';

export default function ReportsPage() {
  const { theme } = useTheme();
  const {
    totalRevenue,
    totalPurchases,
    netProfit,
    totalReceivables,
    totalPayables,
    totalBankBalance,
    totalCashBalance,
    chartOfAccounts,
    invoices,
  } = useAccounting();

  const [activeReport, setActiveReport] = useState('bs'); // 'bs' | 'pl' | 'tax'

  // Total Assets
  const totalCurrentAssets = totalBankBalance + totalCashBalance + totalReceivables + 45000; // + Inventory estimated
  const totalFixedAssets = 250000; // Machinery & Showroom Setup
  const totalAssets = totalCurrentAssets + totalFixedAssets;

  // Total Liabilities & Equity
  const totalLiabilities = totalPayables + 50000; // Loan / Other
  const ownerCapital = 350000;
  const totalEquity = ownerCapital + netProfit;
  const totalLiabAndEquity = totalLiabilities + totalEquity;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ color: theme.textMain }}>
      {/* Top Banner */}
      <div
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.borderLight}`,
          borderRadius: '12px',
          padding: '1.8rem',
          boxShadow: theme.shadow,
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.45rem', fontWeight: 600, color: theme.textMain }}>
              Financial Statements &amp; Audit Reports
            </h1>
            <p style={{ fontSize: '0.82rem', color: theme.textMuted, marginTop: '0.2rem' }}>
              Automated IFRS/GAAP compliant Balance Sheet, Profit &amp; Loss, and Tax summary.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: theme.bgSubtle,
                color: theme.textMain,
                border: `1px solid ${theme.borderLight}`,
                padding: '0.55rem 0.95rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Printer size={14} />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: theme.bgSubtle, padding: '0.35rem', borderRadius: '8px', border: `1px solid ${theme.borderLight}`, marginTop: '1.4rem', width: 'fit-content', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveReport('bs')}
            style={{
              padding: '0.5rem 1.1rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              backgroundColor: activeReport === 'bs' ? theme.bgCard : 'transparent',
              color: activeReport === 'bs' ? theme.accentGold : theme.textMain,
              boxShadow: activeReport === 'bs' ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
            }}
          >
            Balance Sheet (Assets = Liabilities + Equity)
          </button>
          <button
            type="button"
            onClick={() => setActiveReport('pl')}
            style={{
              padding: '0.5rem 1.1rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              backgroundColor: activeReport === 'pl' ? theme.bgCard : 'transparent',
              color: activeReport === 'pl' ? theme.accentGold : theme.textMain,
              boxShadow: activeReport === 'pl' ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
            }}
          >
            Profit &amp; Loss Statement (Income vs Expense)
          </button>
          <button
            type="button"
            onClick={() => setActiveReport('tax')}
            style={{
              padding: '0.5rem 1.1rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              backgroundColor: activeReport === 'tax' ? theme.bgCard : 'transparent',
              color: activeReport === 'tax' ? theme.accentGold : theme.textMain,
              boxShadow: activeReport === 'tax' ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
            }}
          >
            GST &amp; Tax Overview
          </button>
        </div>
      </div>

      {/* Report 1: Balance Sheet */}
      {activeReport === 'bs' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {/* Assets Column */}
          <div
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.borderLight}`,
              borderRadius: '12px',
              padding: '1.8rem',
              boxShadow: theme.shadow,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${theme.borderLight}`, paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: theme.textMain }}>
                Total Assets
              </h2>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.accentGold }}>
                ₹{totalAssets.toLocaleString()}
              </span>
            </div>

            <div style={{ marginBottom: '1.4rem' }}>
              <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: theme.textDim, textTransform: 'uppercase', marginBottom: '0.6rem', letterSpacing: '0.05em' }}>
                Current Assets
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${theme.borderLight}`, fontSize: '0.84rem', color: theme.textMain }}>
                <span>Bank Balance (HDFC Operating)</span>
                <span style={{ fontWeight: 700 }}>₹{totalBankBalance.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${theme.borderLight}`, fontSize: '0.84rem', color: theme.textMain }}>
                <span>Petty Cash on Hand</span>
                <span style={{ fontWeight: 700 }}>₹{totalCashBalance.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${theme.borderLight}`, fontSize: '0.84rem', color: theme.textMain }}>
                <span>Accounts Receivable (Customer Debtors)</span>
                <span style={{ fontWeight: 700 }}>₹{totalReceivables.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${theme.borderLight}`, fontSize: '0.84rem', color: theme.textMain }}>
                <span>Finished Goods &amp; Timber Inventory</span>
                <span style={{ fontWeight: 700 }}>₹45,000</span>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: theme.textDim, textTransform: 'uppercase', marginBottom: '0.6rem', letterSpacing: '0.05em' }}>
                Fixed Assets
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${theme.borderLight}`, fontSize: '0.84rem', color: theme.textMain }}>
                <span>Woodworking Machinery &amp; CNC Tools</span>
                <span style={{ fontWeight: 700 }}>₹150,000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${theme.borderLight}`, fontSize: '0.84rem', color: theme.textMain }}>
                <span>Showroom Interior &amp; Fixtures</span>
                <span style={{ fontWeight: 700 }}>₹100,000</span>
              </div>
            </div>
          </div>

          {/* Liabilities & Equity Column */}
          <div
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.borderLight}`,
              borderRadius: '12px',
              padding: '1.8rem',
              boxShadow: theme.shadow,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${theme.borderLight}`, paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: theme.textMain }}>
                Liabilities &amp; Equity
              </h2>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.accentGold }}>
                ₹{totalLiabAndEquity.toLocaleString()}
              </span>
            </div>

            <div style={{ marginBottom: '1.4rem' }}>
              <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: theme.textDim, textTransform: 'uppercase', marginBottom: '0.6rem', letterSpacing: '0.05em' }}>
                Current Liabilities
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${theme.borderLight}`, fontSize: '0.84rem', color: theme.textMain }}>
                <span>Accounts Payable (Vendor Creditors)</span>
                <span style={{ fontWeight: 700 }}>₹{totalPayables.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${theme.borderLight}`, fontSize: '0.84rem', color: theme.textMain }}>
                <span>Short-Term Working Capital Loan</span>
                <span style={{ fontWeight: 700 }}>₹50,000</span>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: theme.textDim, textTransform: 'uppercase', marginBottom: '0.6rem', letterSpacing: '0.05em' }}>
                Owner&apos;s Equity &amp; Retained Earnings
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${theme.borderLight}`, fontSize: '0.84rem', color: theme.textMain }}>
                <span>Initial Capital Contribution</span>
                <span style={{ fontWeight: 700 }}>₹{ownerCapital.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${theme.borderLight}`, fontSize: '0.84rem', color: theme.textMain }}>
                <span>Retained Earnings (Net Profit to Date)</span>
                <span style={{ fontWeight: 700, color: netProfit >= 0 ? theme.success : theme.error }}>
                  ₹{netProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report 2: Profit & Loss Statement */}
      {activeReport === 'pl' && (
        <div
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.borderLight}`,
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: theme.shadow,
          }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: theme.textMain, marginBottom: '1.4rem' }}>
            Income &amp; Expenditure Statement (P&amp;L)
          </h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: theme.accentGold, textTransform: 'uppercase', marginBottom: '0.6rem', letterSpacing: '0.05em' }}>
              Operating Revenue
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: `1px solid ${theme.borderLight}`, fontSize: '0.86rem', color: theme.textMain }}>
              <span>Furniture Sales Income (Gross Billing)</span>
              <span style={{ fontWeight: 700 }}>₹{totalRevenue.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: theme.error, textTransform: 'uppercase', marginBottom: '0.6rem', letterSpacing: '0.05em' }}>
              Cost of Goods Sold &amp; Operational Expenses
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: `1px solid ${theme.borderLight}`, fontSize: '0.86rem', color: theme.textMain }}>
              <span>Raw Materials &amp; Timber Purchases</span>
              <span style={{ fontWeight: 700 }}>₹{totalPurchases.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: `1px solid ${theme.borderLight}`, fontSize: '0.86rem', color: theme.textMain }}>
              <span>Factory Overheads &amp; Warehouse Rent</span>
              <span style={{ fontWeight: 700 }}>₹12,000</span>
            </div>
          </div>

          {/* Net Profit Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: theme.bgSubtle,
              padding: '1.2rem 1.6rem',
              borderRadius: '8px',
              border: `1px solid ${theme.borderLight}`,
            }}
          >
            <div>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: theme.textMain, display: 'block' }}>
                Net Operating Profit
              </span>
              <span style={{ fontSize: '0.78rem', color: theme.textMuted }}>
                Revenue minus All Costs &amp; Expenditures
              </span>
            </div>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: netProfit >= 0 ? theme.success : theme.error }}>
              ₹{netProfit.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Report 3: Tax / GST */}
      {activeReport === 'tax' && (
        <div
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.borderLight}`,
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: theme.shadow,
          }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: theme.textMain, marginBottom: '1.4rem' }}>
            GST Summary &amp; Input Tax Credit (ITC)
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.2rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ padding: '1.4rem', backgroundColor: theme.bgSubtle, borderRadius: '8px', border: `1px solid ${theme.borderLight}` }}>
              <span style={{ fontSize: '0.78rem', color: theme.textMuted, display: 'block', marginBottom: '0.3rem' }}>Output GST (Collected on Sales)</span>
              <span style={{ fontSize: '1.35rem', fontWeight: 700, color: theme.accentGold }}>₹{Math.round(totalRevenue * 0.18).toLocaleString()}</span>
            </div>
            <div style={{ padding: '1.4rem', backgroundColor: theme.bgSubtle, borderRadius: '8px', border: `1px solid ${theme.borderLight}` }}>
              <span style={{ fontSize: '0.78rem', color: theme.textMuted, display: 'block', marginBottom: '0.3rem' }}>Input GST Credit (Paid on Purchases)</span>
              <span style={{ fontSize: '1.35rem', fontWeight: 700, color: theme.textMain }}>₹{Math.round(totalPurchases * 0.18).toLocaleString()}</span>
            </div>
            <div style={{ padding: '1.4rem', backgroundColor: theme.bgSubtle, borderRadius: '8px', border: `1px solid ${theme.borderLight}` }}>
              <span style={{ fontSize: '0.78rem', color: theme.textMuted, display: 'block', marginBottom: '0.3rem' }}>Net GST Payable to Govt</span>
              <span style={{ fontSize: '1.35rem', fontWeight: 700, color: theme.success }}>₹{Math.max(0, Math.round((totalRevenue - totalPurchases) * 0.18)).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
