import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAccounting } from '../context/AccountingContext';
import { PieChart, Plus, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from '../components/Modal';

export default function BudgetsPage() {
  const { theme } = useTheme();
  const { budgets, analyticAccounts } = useAccounting();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetList, setBudgetList] = useState(budgets);
  const [formData, setFormData] = useState({
    name: '',
    analyticAccountId: analyticAccounts[0]?.id || 'ana-1',
    period: 'FY 2026-27',
    budgetedAmount: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.budgetedAmount) return;

    const targetAnalytic = analyticAccounts.find((a) => a.id === formData.analyticAccountId);
    const newBudget = {
      id: `BUD-00${budgetList.length + 1}`,
      name: formData.name,
      analyticAccountId: formData.analyticAccountId,
      analyticAccountName: targetAnalytic ? targetAnalytic.name : 'General',
      period: formData.period,
      budgetedAmount: Number(formData.budgetedAmount) || 0,
      actualAmount: 0,
    };

    setBudgetList([newBudget, ...budgetList]);
    setFormData({
      name: '',
      analyticAccountId: analyticAccounts[0]?.id || 'ana-1',
      period: 'FY 2026-27',
      budgetedAmount: '',
    });
    setIsModalOpen(false);
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
              Budgets &amp; Analytic Cost Centers
            </h1>
            <p style={{ fontSize: '0.8rem', color: theme.textMuted }}>
              Track departmental budgets, manufacturing cost centers, and financial variances.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: theme.accentGold,
              color: '#0E0D0C',
              border: 'none',
              padding: '0.6rem 1.1rem',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(191, 160, 124, 0.25)',
            }}
          >
            <Plus size={15} />
            <span>+ Set New Budget</span>
          </button>
        </div>
      </div>

      {/* Analytic Accounts Overview Grid */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '0.92rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Active Analytic Accounts (Cost Centers)
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}
        >
          {analyticAccounts.map((ana) => (
            <div
              key={ana.id}
              style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.borderLight}`,
                borderRadius: '8px',
                padding: '1.2rem',
                boxShadow: theme.shadow,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.accentGold }}>{ana.code}</span>
                <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: theme.bgSubtle, color: theme.textMuted }}>
                  {ana.type}
                </span>
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: theme.textMain, marginBottom: '0.3rem' }}>
                {ana.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: theme.textMuted }}>
                Cost Center for tracking operational &amp; material allocation
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Budgets & Variance Analysis Table */}
      <div
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.borderLight}`,
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: theme.shadow,
        }}
      >
        <div style={{ padding: '1.2rem 1.4rem', borderBottom: `1px solid ${theme.borderLight}` }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: theme.textMain }}>
            Fiscal Budgets &amp; Variance Tracking
          </h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ backgroundColor: theme.bgSubtle, borderBottom: `1px solid ${theme.borderLight}`, color: theme.textMuted }}>
                <th style={{ padding: '0.85rem 1.2rem', fontWeight: 600 }}>Budget Name</th>
                <th style={{ padding: '0.85rem 1.2rem', fontWeight: 600 }}>Cost Center</th>
                <th style={{ padding: '0.85rem 1.2rem', fontWeight: 600 }}>Period</th>
                <th style={{ padding: '0.85rem 1.2rem', fontWeight: 600, textAlign: 'right' }}>Budgeted</th>
                <th style={{ padding: '0.85rem 1.2rem', fontWeight: 600, textAlign: 'right' }}>Actual Spent</th>
                <th style={{ padding: '0.85rem 1.2rem', fontWeight: 600 }}>Utilization (% Used)</th>
              </tr>
            </thead>
            <tbody>
              {budgetList.map((b) => {
                const percent = Math.min(100, Math.round((b.actualAmount / b.budgetedAmount) * 100));
                const isOverBudget = b.actualAmount > b.budgetedAmount;

                return (
                  <tr
                    key={b.id}
                    style={{
                      borderBottom: `1px solid ${theme.borderLight}`,
                      color: theme.textMain,
                    }}
                  >
                    <td style={{ padding: '0.85rem 1.2rem', fontWeight: 600, color: theme.accentGold }}>
                      {b.name}
                    </td>
                    <td style={{ padding: '0.85rem 1.2rem', fontWeight: 500 }}>
                      {b.analyticAccountName}
                    </td>
                    <td style={{ padding: '0.85rem 1.2rem', color: theme.textMuted }}>
                      {b.period}
                    </td>
                    <td style={{ padding: '0.85rem 1.2rem', textAlign: 'right', fontWeight: 600 }}>
                      ₹{b.budgetedAmount.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.85rem 1.2rem', textAlign: 'right', fontWeight: 600, color: isOverBudget ? theme.error : theme.textMain }}>
                      ₹{b.actualAmount.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.85rem 1.2rem', minWidth: '160px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            flex: 1,
                            height: '6px',
                            backgroundColor: theme.bgSubtle,
                            borderRadius: '3px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${percent}%`,
                              height: '100%',
                              backgroundColor: percent > 90 ? theme.error : theme.accentGold,
                              borderRadius: '3px',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: percent > 90 ? theme.error : theme.textMuted }}>
                          {percent}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Budget Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Set New Departmental Budget">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.35rem' }}>
              Budget Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Q2 Teakwood Procurement"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              Analytic Cost Center *
            </label>
            <select
              value={formData.analyticAccountId}
              onChange={(e) => setFormData({ ...formData, analyticAccountId: e.target.value })}
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
              {analyticAccounts.map((ana) => (
                <option key={ana.id} value={ana.id}>
                  {ana.code} - {ana.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.35rem' }}>
                Period *
              </label>
              <input
                type="text"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
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
                Budget Amount (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="e.g. 50000"
                value={formData.budgetedAmount}
                onChange={(e) => setFormData({ ...formData, budgetedAmount: e.target.value })}
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
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.8rem' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
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
              Save Budget
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
