import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAccounting } from '../context/AccountingContext';
import { BookOpen, Search, Filter, ArrowUpRight, ArrowDownLeft, ShieldCheck, Plus } from 'lucide-react';
import Modal from '../components/Modal';

export default function AccountingPage() {
  const { theme } = useTheme();
  const { chartOfAccounts, journalEntries } = useAccounting();

  const [activeTab, setActiveTab] = useState('coa'); // 'coa' | 'journals'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  // Filtered CoA
  const filteredAccounts = chartOfAccounts.filter((acc) => {
    const matchesSearch =
      acc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All' || acc.type === filterType;
    return matchesSearch && matchesType;
  });

  // Filtered Journals
  const filteredJournals = journalEntries.filter((je) => {
    const matchesSearch =
      je.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      je.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      je.journal.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div style={{ color: theme.textMain }}>
      {/* Top Banner / Tab Switcher */}
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
              Accounting &amp; Double-Entry Ledger
            </h1>
            <p style={{ fontSize: '0.82rem', color: theme.textMuted, marginTop: '0.2rem' }}>
              Chart of accounts master, balanced double-entry journal vouchers, and audit trail.
            </p>
          </div>

          {/* Tab Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: theme.bgSubtle, padding: '0.35rem', borderRadius: '8px', border: `1px solid ${theme.borderLight}` }}>
            <button
              type="button"
              onClick={() => { setActiveTab('coa'); setSearchQuery(''); }}
              style={{
                padding: '0.5rem 1.1rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: activeTab === 'coa' ? theme.bgCard : 'transparent',
                color: activeTab === 'coa' ? theme.accentGold : theme.textMain,
                boxShadow: activeTab === 'coa' ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              Chart of Accounts ({chartOfAccounts.length})
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('journals'); setSearchQuery(''); }}
              style={{
                padding: '0.5rem 1.1rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: activeTab === 'journals' ? theme.bgCard : 'transparent',
                color: activeTab === 'journals' ? theme.accentGold : theme.textMain,
                boxShadow: activeTab === 'journals' ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              Journal Entries ({journalEntries.length})
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.4rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: theme.textDim }} />
            <input
              type="text"
              placeholder={activeTab === 'coa' ? 'Search by account code or name...' : 'Search by reference, voucher #, journal...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                fontSize: '0.84rem',
                borderRadius: '6px',
                border: `1px solid ${theme.borderLight}`,
                backgroundColor: theme.bgInput,
                color: theme.textMain,
                outline: 'none',
              }}
            />
          </div>

          {activeTab === 'coa' && (
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: '0.65rem 1.1rem',
                fontSize: '0.84rem',
                borderRadius: '6px',
                border: `1px solid ${theme.borderLight}`,
                backgroundColor: theme.bgInput,
                color: theme.textMain,
                outline: 'none',
              }}
            >
              <option value="All">All Types</option>
              <option value="Asset">Assets</option>
              <option value="Liability">Liabilities</option>
              <option value="Equity">Equity</option>
              <option value="Income">Income</option>
              <option value="Expense">Expenses</option>
            </select>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'coa' ? (
        <div
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.borderLight}`,
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: theme.shadow,
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ backgroundColor: theme.bgSubtle }}>
                  <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Code</th>
                  <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Name</th>
                  <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                  <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Current Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((acc) => (
                  <tr
                    key={acc.id}
                    style={{
                      borderBottom: `1px solid ${theme.borderLight}`,
                      color: theme.textMain,
                    }}
                  >
                    <td style={{ padding: '0.95rem 1.2rem', fontWeight: 700, color: theme.accentGold, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {acc.code}
                    </td>
                    <td style={{ padding: '0.95rem 1.2rem', fontWeight: 600, color: theme.textMain }}>
                      {acc.name}
                    </td>
                    <td style={{ padding: '0.95rem 1.2rem' }}>
                      <span
                        style={{
                          padding: '0.25rem 0.6rem',
                          borderRadius: '4px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          backgroundColor:
                            acc.type === 'Asset'
                              ? theme.accentGoldSoft
                              : acc.type === 'Liability'
                              ? theme.errorBg
                              : acc.type === 'Income'
                              ? theme.successBg
                              : theme.bgSubtle,
                          color:
                            acc.type === 'Asset'
                              ? theme.accentGold
                              : acc.type === 'Liability'
                              ? theme.error
                              : acc.type === 'Income'
                              ? theme.success
                              : theme.textMain,
                          border: `1px solid ${theme.borderLight}`,
                        }}
                      >
                        {acc.type}
                      </span>
                    </td>
                    <td style={{ padding: '0.95rem 1.2rem', textAlign: 'right', fontWeight: 700, color: theme.textMain, fontSize: '0.9rem' }}>
                      ₹{acc.balance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {filteredJournals.map((je) => {
            const totalDebit = je.lines.reduce((s, l) => s + (l.debit || 0), 0);
            const totalCredit = je.lines.reduce((s, l) => s + (l.credit || 0), 0);
            const isBalanced = totalDebit === totalCredit;

            return (
              <div
                key={je.id}
                style={{
                  backgroundColor: theme.bgCard,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '12px',
                  padding: '1.6rem',
                  boxShadow: theme.shadow,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{ fontWeight: 700, color: theme.accentGold, fontSize: '0.95rem' }}>
                      {je.id}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: theme.textDim }}>•</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: theme.textMain }}>
                      {je.journal}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: theme.textDim }}>•</span>
                    <span style={{ fontSize: '0.82rem', color: theme.textMuted }}>
                      {je.date}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        backgroundColor: theme.successBg,
                        color: theme.success,
                        border: `1px solid ${theme.success}`,
                      }}
                    >
                      {je.status}
                    </span>
                    {isBalanced && (
                      <span
                        style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '4px',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          backgroundColor: theme.bgSubtle,
                          color: theme.accentGold,
                          border: `1px solid ${theme.borderLight}`,
                        }}
                      >
                        ✓ Balanced
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ fontSize: '0.84rem', color: theme.textMuted, marginBottom: '1rem' }}>
                  <strong style={{ color: theme.textMain }}>Narration / Ref:</strong> {je.ref}
                </div>

                {/* Journal Entry Lines Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: theme.bgSubtle }}>
                        <th style={{ padding: '0.55rem 0.85rem', color: theme.textDim, fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>Account</th>
                        <th style={{ padding: '0.55rem 0.85rem', color: theme.textDim, fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase', textAlign: 'right' }}>Debit (₹)</th>
                        <th style={{ padding: '0.55rem 0.85rem', color: theme.textDim, fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase', textAlign: 'right' }}>Credit (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {je.lines.map((line, idx) => (
                        <tr key={idx} style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
                          <td style={{ padding: '0.65rem 0.85rem', color: theme.textMain }}>
                            <span style={{ color: theme.accentGold, fontWeight: 700, marginRight: '0.6rem', fontFamily: 'monospace' }}>{line.accountCode}</span>
                            {line.accountName}
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', color: line.debit > 0 ? theme.textMain : theme.textDim, fontWeight: line.debit > 0 ? 700 : 400 }}>
                            {line.debit > 0 ? `₹${line.debit.toLocaleString()}` : '-'}
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', color: line.credit > 0 ? theme.textMain : theme.textDim, fontWeight: line.credit > 0 ? 700 : 400 }}>
                            {line.credit > 0 ? `₹${line.credit.toLocaleString()}` : '-'}
                          </td>
                        </tr>
                      ))}
                      <tr style={{ fontWeight: 700, color: theme.textMain, backgroundColor: theme.bgSubtle }}>
                        <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', color: theme.textMain }}>Total:</td>
                        <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', color: theme.accentGold, fontSize: '0.9rem' }}>₹{totalDebit.toLocaleString()}</td>
                        <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', color: theme.accentGold, fontSize: '0.9rem' }}>₹{totalCredit.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
