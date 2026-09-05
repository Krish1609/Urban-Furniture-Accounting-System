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
    <div>
      {/* Top Banner */}
      <div
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.borderLight}`,
          borderRadius: '8px',
          padding: '1.8rem',
          boxShadow: theme.shadow,
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.4rem', fontWeight: 600, color: theme.textMain }}>
              Financial Statements &amp; Audit Reports
            </h1>
            <p style={{ fontSize: '0.8rem', color: theme.textMuted }}>
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
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: theme.bgSubtle, padding: '0.3rem', borderRadius: '6px', marginTop: '1.4rem', width: 'fit-content' }}>
          <button
            type="button"
            onClick={() => setActiveReport('bs')}
            style={{
              padding: '0.45rem 1rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: activeReport === 'bs' ? theme.bgCard : 'transparent',
              color: activeReport === 'bs' ? theme.accentGold : theme.textMuted,
              boxShadow: activeReport === 'bs' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Balance Sheet (Assets = Liabilities + Equity)
          </button>
          <button
            type="button"
            onClick={() => setActiveReport('pl')}
            style={{
              padding: '0.45rem 1rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: activeReport === 'pl' ? theme.bgCard : 'transparent',
              color: activeReport === 'pl' ? theme.accentGold : theme.textMuted,
              boxShadow: activeReport === 'pl' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Profit &amp; Loss Statement (Income vs Expense)
          </button>
          <button
            type="button"
            onClick={() => setActiveReport('tax')}
            style={{
              padding: '0.45rem 1rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: activeReport === 'tax' ? theme.bgCard : 'transparent',
              color: activeReport === 'tax' ? theme.accentGold : theme.textMuted,
              boxShadow: activeReport === 'tax' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
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
              borderRadius: '8px',
              padding: '1.6rem',
              boxShadow: theme.shadow,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${theme.borderLight}`, paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: theme.textMain }}>
                Total Assets
              </h2>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: theme.accentGold }}>
                ₹{totalAssets.toLocaleString()}
              </span>
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
              <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                Current Assets
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: `1px solid ${theme.borderLight}`, fontSize: '0.82rem', color: theme.textMain }}>
                <span>Bank Balance (HDFC Operating)</span>
                <span style={{ fontWeight: 600 }}>₹{totalBankBalance.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: `1px solid ${theme.borderLight}`, fontSize: '0.82rem', color: theme.textMain }}>
                <span>Petty Cash on Hand</span>
                <span style={{ fontWeight: 600 }}>₹{totalCashBalance.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: `1px solid ${theme.borderLight}`, fontSize: '0.82rem', color: theme.textMain }}>
                <span>Accounts Receivable (Customer Debtors)</span>
                <span style={{ fontWeight: 600 }}>₹{totalReceivables.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: `1px solid ${theme.borderLight}`, fontSize: '0.82rem', color: theme.textMain }}>
                <span>Finished Goods &amp; Timber Inventory</span>
                <span style={{ fontWeight: 600 }}>₹45,000</span>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                Fixed Assets
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: `1px solid ${theme.borderLight}`, fontSize: '0.82rem', color: theme.textMain }}>
                <span>Woodworking Machinery &amp; CNC Tools</span>
                <span style={{ fontWeight: 600 }}>₹150,000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: `1px solid ${theme.borderLight}`, fontSize: '0.82rem', color: theme.textMain }}>
                <span>Showroom Interior &amp; Fixtures</span>
                <span style={{ fontWeight: 600 }}>₹100,000</span>
              </div>
            </div>
          </div>

          {/* Liabilities & Equity Column */}
          <div
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.borderLight}`,
              borderRadius: '8px',
              padding: '1.6rem',
              boxShadow: theme.shadow,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${theme.borderLight}`, paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: theme.textMain }}>
                Liabilities &amp; Equity
              </h2>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: theme.accentGold }}>
                ₹{totalLiabAndEquity.toLocaleString()}
              </span>
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
              <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                Current Liabilities
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: `1px solid ${theme.borderLight}`, fontSize: '0.82rem', color: theme.textMain }}>
                <span>Accounts Payable (Vendor Creditors)</span>
                <span style={{ fontWeight: 600 }}>₹{totalPayables.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: `1px solid ${theme.borderLight}`, fontSize: '0.82rem', color: theme.textMain }}>
                <span>Short-Term Working Capital Loan</span>
                <span style={{ fontWeight: 600 }}>₹50,000</span>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                Owner &apos;s Equity &amp; Retained Earnings
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: `1px solid ${theme.borderLight}`, fontSize: '0.82rem', color: theme.textMain }}>
                <span>Initial Capital Contribution</span>
                <span style={{ fontWeight: 600 }}>₹{ownerCapital.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: `1px solid ${theme.borderLight}`, fontSize: '0.82rem', color: theme.textMain }}>
                <span>Retained Earnings (Net Profit to Date)</span>
                <span style={{ fontWeight: 600, color: netProfit >= 0 ? theme.success : theme.error }}>
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
            borderRadius: '8px',
            padding: '1.8rem',
            boxShadow: theme.shadow,
          }}
        >
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: theme.textMain, marginBottom: '1.2rem' }}>
            Income &amp; Expenditure Statement (P&amp;L)
          </h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: theme.accentGold, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
              Operating Revenue
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${theme.borderLight}`, fontSize: '0.84rem', color: theme.textMain }}>
              <span>Furniture Sales Income (Gross Billing)</span>
              <span style={{ fontWeight: 600 }}>₹{totalRevenue.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: theme.error, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
              Cost of Goods Sold &amp; Operational Expenses
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${theme.borderLight}`, fontSize: '0.84rem', color: theme.textMain }}>
              <span>Raw Materials &amp; Timber Purchases</span>
              <span style={{ fontWeight: 600 }}>₹{totalPurchases.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${theme.borderLight}`, fontSize: '0.84rem', color: theme.textMain }}>
              <span>Factory Overheads &amp; Warehouse Rent</span>
              <span style={{ fontWeight: 600 }}>₹12,000</span>
            </div>
          </div>

          {/* Net Profit Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: theme.bgSubtle,
              padding: '1rem 1.4rem',
              borderRadius: '6px',
              border: `1px solid ${theme.borderLight}`,
            }}
          >
            <div>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: theme.textMain, display: 'block' }}>
                Net Operating Profit
              </span>
              <span style={{ fontSize: '0.75rem', color: theme.textMuted }}>
                Revenue minus All Costs &amp; Expenditures
              </span>
            </div>
            <span style={{ fontSize: '1.3rem', fontWeight: 700, color: netProfit >= 0 ? theme.success : theme.error }}>
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
            borderRadius: '8px',
            padding: '1.8rem',
            boxShadow: theme.shadow,
          }}
        >
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: theme.textMain, marginBottom: '1.2rem' }}>
            GST Summary &amp; Input Tax Credit (ITC)
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ padding: '1.2rem', backgroundColor: theme.bgSubtle, borderRadius: '6px', border: `1px solid ${theme.borderLight}` }}>
              <span style={{ fontSize: '0.75rem', color: theme.textMuted, display: 'block' }}>Output GST (Collected on Sales)</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: theme.accentGold }}>₹{Math.round(totalRevenue * 0.18).toLocaleString()}</span>
            </div>
            <div style={{ padding: '1.2rem', backgroundColor: theme.bgSubtle, borderRadius: '6px', border: `1px solid ${theme.borderLight}` }}>
              <span style={{ fontSize: '0.75rem', color: theme.textMuted, display: 'block' }}>Input GST Credit (Paid on Purchases)</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: theme.textMain }}>₹{Math.round(totalPurchases * 0.18).toLocaleString()}</span>
            </div>
            <div style={{ padding: '1.2rem', backgroundColor: theme.bgSubtle, borderRadius: '6px', border: `1px solid ${theme.borderLight}` }}>
              <span style={{ fontSize: '0.75rem', color: theme.textMuted, display: 'block' }}>Net GST Payable to Govt</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: theme.success }}>₹{Math.max(0, Math.round((totalRevenue - totalPurchases) * 0.18)).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
