import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAccounting } from '../context/AccountingContext';
import {
  BookOpen,
  Search,
  Plus,
  ArrowLeft,
  Home,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  Trash2,
  Archive,
  RotateCcw,
  Check,
  X
} from 'lucide-react';

export default function AccountingPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    chartOfAccounts,
    journals,
    journalEntries,
    contacts,
    createAccount,
    toggleArchiveAccount,
    createJournal,
    updateJournal,
    createJournalEntry
  } = useAccounting();

  // Active module tab: 'coa' | 'journals' | 'journal-entries'
  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.tab || 'coa';
  });

  // Sub-view modes: 'list' | 'form'
  const [coaViewMode, setCoaViewMode] = useState('list');
  const [journalViewMode, setJournalViewMode] = useState('list');
  const [jeViewMode, setJeViewMode] = useState('list');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchivedCoa, setShowArchivedCoa] = useState(false);
  const [selectedCoaIds, setSelectedCoaIds] = useState([]);
  const [notification, setNotification] = useState(null);

  // Sync tab with location state changes (e.g. from Mega menu)
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  const showToast = (text) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 3500);
  };

  // ─────────────────────────────────────────────────────────────
  // 1. CHART OF ACCOUNTS STATE & HANDLERS
  // ─────────────────────────────────────────────────────────────
  const [coaFormData, setCoaFormData] = useState({
    name: '',
    type: 'Asset', // Asset, Liability, Bank, Capital, Cash, Income, Expenses, Other Expenses
  });

  const handleNewCoaClick = () => {
    setCoaFormData({ name: '', type: 'Asset' });
    setCoaViewMode('form');
  };

  const handleConfirmCoaSave = (e) => {
    if (e) e.preventDefault();
    if (!coaFormData.name.trim()) {
      alert('Please enter Account Name');
      return;
    }

    createAccount({
      name: coaFormData.name.trim(),
      type: coaFormData.type,
    });

    showToast(`Account "${coaFormData.name}" created successfully!`);
    setCoaFormData({ name: '', type: 'Asset' });
    setCoaViewMode('list');
  };

  const handleToggleArchiveSelected = () => {
    if (selectedCoaIds.length === 0) {
      setShowArchivedCoa(!showArchivedCoa);
      return;
    }
    selectedCoaIds.forEach((id) => {
      const target = (chartOfAccounts || []).find((a) => a.id === id || a.code === id);
      if (target) {
        toggleArchiveAccount(target.id || target.code, target.isArchived);
      }
    });
    showToast(`Updated archive status for ${selectedCoaIds.length} account(s)`);
    setSelectedCoaIds([]);
  };

  const filteredAccounts = (chartOfAccounts || []).filter((acc) => {
    if (!acc) return false;
    const matchesSearch =
      (acc.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (acc.type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (acc.code || '').toLowerCase().includes(searchQuery.toLowerCase());

    const isArchived = Boolean(acc.isArchived || acc.isActive === false);
    const matchesArchive = showArchivedCoa ? true : !isArchived;

    return matchesSearch && matchesArchive;
  });

  // ─────────────────────────────────────────────────────────────
  // 2. JOURNALS STATE & HANDLERS
  // ─────────────────────────────────────────────────────────────
  const [editingJournalId, setEditingJournalId] = useState(null);
  const [journalFormData, setJournalFormData] = useState({
    name: '',
    type: 'Sales', // Sales | Purchase | Bank | Cash
    defaultAccount: 'Sales Income A/c',
    defaultAccountId: '',
  });

  const handleNewJournalClick = () => {
    setEditingJournalId(null);
    setJournalFormData({
      name: '',
      type: 'Sales',
      defaultAccount: 'Sales Income A/c',
      defaultAccountId: '',
    });
    setJournalViewMode('form');
  };

  const handleEditJournalRow = (jrn) => {
    setEditingJournalId(jrn.id);
    setJournalFormData({
      name: jrn.name || '',
      type: jrn.type || 'Sales',
      defaultAccount: jrn.defaultAccount || 'Sales Income A/c',
      defaultAccountId: jrn.defaultAccountId || '',
    });
    setJournalViewMode('form');
  };

  const handleConfirmJournalSave = (e) => {
    if (e) e.preventDefault();
    if (!journalFormData.name.trim()) {
      alert('Please enter Journal Name');
      return;
    }

    if (editingJournalId) {
      updateJournal(editingJournalId, journalFormData);
      showToast(`Journal "${journalFormData.name}" updated successfully!`);
    } else {
      createJournal(journalFormData);
      showToast(`Journal "${journalFormData.name}" created successfully!`);
    }

    setJournalViewMode('list');
  };

  const filteredJournals = (journals || []).filter((jrn) => {
    if (!jrn) return false;
    const q = searchQuery.toLowerCase();
    return (
      (jrn.name || '').toLowerCase().includes(q) ||
      (jrn.type || '').toLowerCase().includes(q) ||
      (jrn.defaultAccount || '').toLowerCase().includes(q)
    );
  });

  // ─────────────────────────────────────────────────────────────
  // 3. JOURNAL ENTRIES STATE & HANDLERS
  // ─────────────────────────────────────────────────────────────
  const [jeFormData, setJeFormData] = useState({
    accountingDate: new Date().toISOString().split('T')[0],
    journal: 'Purchase', // Sales | Purchase | Bank | Cash
    lines: [
      {
        id: '1',
        account: 'Purchase Expense A/c',
        accountId: '',
        partner: 'Mr Rahul',
        partnerId: '',
        debit: '10000',
        credit: '0',
      },
      {
        id: '2',
        account: 'Bank A/c',
        accountId: '',
        partner: 'Mr Rahul',
        partnerId: '',
        debit: '0',
        credit: '10000',
      },
    ],
  });

  const handleNewJeClick = () => {
    const defaultAcc1 = (chartOfAccounts || []).find((a) => a.name.includes('Expense'))?.name || 'Purchase Expense A/c';
    const defaultAcc2 = (chartOfAccounts || []).find((a) => a.name.includes('Bank'))?.name || 'Bank A/c';
    const defaultPartner = (contacts || [])[0]?.name || 'Mr Rahul';

    setJeFormData({
      accountingDate: new Date().toISOString().split('T')[0],
      journal: 'Purchase',
      lines: [
        { id: '1', account: defaultAcc1, accountId: '', partner: defaultPartner, partnerId: '', debit: '', credit: '0' },
        { id: '2', account: defaultAcc2, accountId: '', partner: defaultPartner, partnerId: '', debit: '0', credit: '' },
      ],
    });
    setJeViewMode('form');
  };

  const handleAddJeLine = () => {
    const defaultPartner = (contacts || [])[0]?.name || '-';
    const defaultAcc = (chartOfAccounts || [])[0]?.name || 'Bank A/c';
    setJeFormData((prev) => ({
      ...prev,
      lines: [
        ...prev.lines,
        {
          id: String(Date.now()),
          account: defaultAcc,
          accountId: '',
          partner: defaultPartner,
          partnerId: '',
          debit: '0',
          credit: '0',
        },
      ],
    }));
  };

  const handleRemoveJeLine = (lineId) => {
    if (jeFormData.lines.length <= 2) {
      alert('A double-entry voucher must have at least 2 lines.');
      return;
    }
    setJeFormData((prev) => ({
      ...prev,
      lines: prev.lines.filter((l) => l.id !== lineId),
    }));
  };

  const handleJeLineChange = (lineId, field, value) => {
    setJeFormData((prev) => ({
      ...prev,
      lines: prev.lines.map((l) => (l.id === lineId ? { ...l, [field]: value } : l)),
    }));
  };

  // Calculations for debit vs credit validation
  const totalDebit = jeFormData.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = jeFormData.lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const isDebitsEqualCredits = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;
  const isUnbalanced = Math.abs(totalDebit - totalCredit) >= 0.01 || totalDebit === 0;

  const handlePostJe = (e) => {
    if (e) e.preventDefault();

    if (isUnbalanced) {
      alert(`Blocking Warning: Debit total (₹${totalDebit.toLocaleString()}) and Credit total (₹${totalCredit.toLocaleString()}) do not match! Entry cannot be posted.`);
      return;
    }

    const year = new Date().getFullYear();
    const prefix = jeFormData.journal === 'Purchase' ? 'RB' : jeFormData.journal === 'Sales' ? 'Inv' : 'JE';
    const randomNum = String(Math.floor(1000 + Math.random() * 9000));
    const entryNumber = `${prefix}/${year}/${randomNum}`;

    const newEntry = {
      entryNumber,
      date: jeFormData.accountingDate,
      accountingDate: jeFormData.accountingDate,
      journal: jeFormData.journal,
      partner: jeFormData.lines[0]?.partner || '-',
      status: 'posted',
      lines: jeFormData.lines.map((l) => ({
        accountName: l.account,
        partner: l.partner,
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
      })),
    };

    createJournalEntry(newEntry);
    showToast(`Journal Entry ${entryNumber} posted successfully!`);
    setJeViewMode('list');
  };

  const filteredJournalEntries = (journalEntries || []).filter((je) => {
    if (!je) return false;
    const q = searchQuery.toLowerCase();
    return (
      (je.number || je.id || '').toLowerCase().includes(q) ||
      (je.partner || '').toLowerCase().includes(q) ||
      (je.journal || '').toLowerCase().includes(q) ||
      (je.status || '').toLowerCase().includes(q) ||
      (je.date || '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ color: theme.textMain, maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.75rem 1.2rem',
            backgroundColor: theme.successBg,
            color: theme.success,
            border: `1px solid ${theme.success}`,
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
            fontWeight: 600,
            fontSize: '0.85rem',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{notification}</span>
        </div>
      )}

      {/* Module Navigation Tabs matching Diagram (Chart of Accounts | Journals | Journal Entries) */}
      <div
        style={{
          display: 'flex',
          gap: '0.6rem',
          marginBottom: '1.4rem',
          backgroundColor: theme.bgCard,
          padding: '0.5rem',
          borderRadius: '10px',
          border: `1px solid ${theme.borderLight}`,
          boxShadow: theme.shadow,
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => {
            setActiveTab('coa');
            setCoaViewMode('list');
            setSearchQuery('');
          }}
          style={{
            flex: 1,
            minWidth: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            fontSize: '0.86rem',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'coa' ? theme.accentGold : 'transparent',
            color: activeTab === 'coa' ? '#0E0D0C' : theme.textMuted,
            transition: 'all 0.15s ease',
          }}
        >
          <BookOpen size={16} />
          <span>Chart of Accounts</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('journals');
            setJournalViewMode('list');
            setSearchQuery('');
          }}
          style={{
            flex: 1,
            minWidth: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            fontSize: '0.86rem',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'journals' ? theme.accentGold : 'transparent',
            color: activeTab === 'journals' ? '#0E0D0C' : theme.textMuted,
            transition: 'all 0.15s ease',
          }}
        >
          <Layers size={16} />
          <span>Journals</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('journal-entries');
            setJeViewMode('list');
            setSearchQuery('');
          }}
          style={{
            flex: 1,
            minWidth: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            fontSize: '0.86rem',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'journal-entries' ? theme.accentGold : 'transparent',
            color: activeTab === 'journal-entries' ? '#0E0D0C' : theme.textMuted,
            transition: 'all 0.15s ease',
          }}
        >
          <FileSpreadsheet size={16} />
          <span>Journal Entries</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MODULE 1: CHART OF ACCOUNTS (LIST VIEW & FORM VIEW)
          ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'coa' && (
        <div
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.borderLight}`,
            borderRadius: '12px',
            padding: '1.8rem',
            boxShadow: theme.shadow,
          }}
        >
          {/* Action Bar: [New] [Confirm] [Archived] ... [Home] [Back] */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '1.2rem',
              borderBottom: `1px solid ${theme.borderLight}`,
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            {/* Left Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleNewCoaClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.55rem 1.2rem',
                  backgroundColor: coaViewMode === 'form' ? theme.bgSubtle : theme.accentGold,
                  color: coaViewMode === 'form' ? theme.textMain : '#0E0D0C',
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '6px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} />
                <span>New</span>
              </button>

              <button
                type="button"
                onClick={coaViewMode === 'form' ? handleConfirmCoaSave : () => showToast('Select an account to confirm or view')}
                style={{
                  padding: '0.55rem 1.2rem',
                  backgroundColor: coaViewMode === 'form' ? theme.accentGold : theme.bgSubtle,
                  color: coaViewMode === 'form' ? '#0E0D0C' : theme.textMain,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '6px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Confirm
              </button>

              <button
                type="button"
                onClick={handleToggleArchiveSelected}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.55rem 1.2rem',
                  backgroundColor: showArchivedCoa ? theme.accentGoldSoft : theme.bgSubtle,
                  color: showArchivedCoa ? theme.accentGold : theme.textMuted,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '6px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Archive size={14} />
                <span>{showArchivedCoa ? 'Show Active' : 'Archived'}</span>
              </button>
            </div>

            {/* Right Navigation: [Home] [Back] */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.55rem 1rem',
                  backgroundColor: theme.bgSubtle,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: theme.textMain,
                  cursor: 'pointer',
                }}
              >
                <Home size={14} />
                <span>Home</span>
              </button>

              <button
                type="button"
                onClick={() => (coaViewMode === 'form' ? setCoaViewMode('list') : navigate('/dashboard'))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.55rem 1rem',
                  backgroundColor: theme.bgSubtle,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: theme.textMain,
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            </div>
          </div>

          {/* 1.1 FORM VIEW: When Clicking on New (Chart of Accounts Form) */}
          {coaViewMode === 'form' ? (
            <div
              style={{
                backgroundColor: theme.bgSubtle,
                border: `1px solid ${theme.borderLight}`,
                borderRadius: '10px',
                padding: '1.8rem 2rem',
                maxWidth: '680px',
                margin: '0 auto',
              }}
            >
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: theme.textMain, marginBottom: '1.2rem' }}>
                Create New Chart of Account
              </h2>

              <form onSubmit={handleConfirmCoaSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {/* Account Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: theme.textMuted }}>
                    Account Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bank A/c, Machinery A/c, Discount Allowed"
                    value={coaFormData.name}
                    onChange={(e) => setCoaFormData({ ...coaFormData, name: e.target.value })}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderLight}`,
                      backgroundColor: theme.bgInput,
                      color: theme.textMain,
                      fontSize: '0.86rem',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Account Type with Grouped Selection (Balancesheet vs Profit and Loss) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: theme.textMuted }}>
                    Type *
                  </label>
                  <select
                    value={coaFormData.type}
                    onChange={(e) => setCoaFormData({ ...coaFormData, type: e.target.value })}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderLight}`,
                      backgroundColor: theme.bgInput,
                      color: theme.textMain,
                      fontSize: '0.86rem',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <optgroup label="── Balancesheet (Financial Position) ──" style={{ color: '#F97316', fontWeight: 700 }}>
                      <option value="Asset" style={{ color: theme.textMain }}>Asset</option>
                      <option value="Liability" style={{ color: theme.textMain }}>Liability</option>
                      <option value="Bank" style={{ color: theme.textMain }}>Bank</option>
                      <option value="Capital" style={{ color: theme.textMain }}>Capital</option>
                      <option value="Cash" style={{ color: theme.textMain }}>Cash</option>
                    </optgroup>

                    <optgroup label="── Profit and Loss (Income & Expenses) ──" style={{ color: '#F97316', fontWeight: 700 }}>
                      <option value="Income" style={{ color: theme.textMain }}>Income</option>
                      <option value="Expenses" style={{ color: theme.textMain }}>Expenses</option>
                      <option value="Other Expenses" style={{ color: theme.textMain }}>Other Expenses</option>
                    </optgroup>
                  </select>
                </div>

                {/* Informational Tip box from diagram */}
                <div
                  style={{
                    backgroundColor: theme.bgCard,
                    border: `1px solid ${theme.accentGold}`,
                    borderRadius: '8px',
                    padding: '0.9rem 1.1rem',
                    fontSize: '0.78rem',
                    color: theme.textMuted,
                    lineHeight: '1.45',
                  }}
                >
                  <strong style={{ color: theme.accentGold, display: 'block', marginBottom: '0.2rem' }}>
                    💡 Account Type Classification:
                  </strong>
                  Each account is assigned an Account Type, which would further be used for how the account is treated and where it appears in balance sheet and profit &amp; loss reports.
                </div>

                {/* Form Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.6rem' }}>
                  <button
                    type="button"
                    onClick={() => setCoaViewMode('list')}
                    style={{
                      padding: '0.55rem 1.2rem',
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderLight}`,
                      backgroundColor: 'transparent',
                      color: theme.textMuted,
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.55rem 1.4rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: theme.accentGold,
                      color: '#0E0D0C',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Confirm &amp; Save
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* 1.2 LIST VIEW: Chart of Accounts Table */
            <div>
              {/* Search Bar & Subtitle */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '0.8rem',
                }}
              >
                <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
                  <Search
                    size={15}
                    style={{
                      position: 'absolute',
                      left: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: theme.textDim,
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search accounts by name or type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.85rem 0.5rem 2.2rem',
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderLight}`,
                      backgroundColor: theme.bgInput,
                      color: theme.textMain,
                      fontSize: '0.82rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ fontSize: '0.78rem', color: theme.textDim }}>
                  * All standard accounts are pre-configured in ledger
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto', border: `1px solid ${theme.borderLight}`, borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: theme.bgSubtle, borderBottom: `1px solid ${theme.borderLight}` }}>
                      <th style={{ width: '45px', padding: '0.8rem 1rem', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedCoaIds.length === filteredAccounts.length && filteredAccounts.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedCoaIds(filteredAccounts.map((a) => a.id || a.code));
                            else setSelectedCoaIds([]);
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                      </th>
                      <th style={{ padding: '0.8rem 1.2rem', color: theme.textDim, fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Account Name
                      </th>
                      <th style={{ padding: '0.8rem 1.2rem', color: theme.textDim, fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Type
                      </th>
                      <th style={{ padding: '0.8rem 1.2rem', color: theme.textDim, fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>
                        Balance (₹)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: '2.5rem', textAlign: 'center', color: theme.textMuted }}>
                          No accounts found.
                        </td>
                      </tr>
                    ) : (
                      filteredAccounts.map((acc) => {
                        const isSelected = selectedCoaIds.includes(acc.id || acc.code);
                        const isArchived = Boolean(acc.isArchived || acc.isActive === false);

                        return (
                          <tr
                            key={acc.id || acc.code}
                            style={{
                              borderBottom: `1px solid ${theme.borderLight}`,
                              backgroundColor: isSelected ? theme.accentGoldSoft : 'transparent',
                              opacity: isArchived ? 0.6 : 1,
                            }}
                          >
                            <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  const id = acc.id || acc.code;
                                  setSelectedCoaIds((prev) =>
                                    prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
                                  );
                                }}
                                style={{ cursor: 'pointer' }}
                              />
                            </td>
                            <td style={{ padding: '0.85rem 1.2rem', fontWeight: 600, color: theme.textMain }}>
                              <span style={{ color: theme.accentGold, fontFamily: 'monospace', fontSize: '0.8rem', marginRight: '0.6rem' }}>
                                [{acc.code}]
                              </span>
                              <span>{acc.name}</span>
                              {isArchived && (
                                <span style={{ marginLeft: '0.6rem', fontSize: '0.68rem', padding: '0.15rem 0.4rem', backgroundColor: theme.errorBg, color: theme.error, borderRadius: '4px' }}>
                                  Archived
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '0.85rem 1.2rem' }}>
                              <span
                                style={{
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  padding: '0.25rem 0.6rem',
                                  borderRadius: '4px',
                                  border: `1px solid ${theme.borderLight}`,
                                  backgroundColor:
                                    acc.type === 'Asset' || acc.type === 'Assets' || acc.type === 'Bank' || acc.type === 'Cash'
                                      ? theme.accentGoldSoft
                                      : acc.type === 'Liability'
                                      ? theme.errorBg
                                      : acc.type === 'Income'
                                      ? theme.successBg
                                      : theme.bgSubtle,
                                  color:
                                    acc.type === 'Asset' || acc.type === 'Assets' || acc.type === 'Bank' || acc.type === 'Cash'
                                      ? theme.accentGold
                                      : acc.type === 'Liability'
                                      ? theme.error
                                      : acc.type === 'Income'
                                      ? theme.success
                                      : theme.textMain,
                                }}
                              >
                                {acc.type}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 1.2rem', textAlign: 'right', fontWeight: 700, color: theme.textMain }}>
                              ₹{(Number(acc.balance) || 0).toLocaleString()}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODULE 2: JOURNALS (LIST VIEW & FORM VIEW)
          ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'journals' && (
        <div
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.borderLight}`,
            borderRadius: '12px',
            padding: '1.8rem',
            boxShadow: theme.shadow,
          }}
        >
          {/* Header Action Bar: [New] ... [Back] */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '1.2rem',
              borderBottom: `1px solid ${theme.borderLight}`,
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={handleNewJournalClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.55rem 1.3rem',
                backgroundColor: theme.accentGold,
                color: '#0E0D0C',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Plus size={14} />
              <span>New</span>
            </button>

            <button
              type="button"
              onClick={() => (journalViewMode === 'form' ? setJournalViewMode('list') : navigate('/dashboard'))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.55rem 1rem',
                backgroundColor: theme.bgSubtle,
                border: `1px solid ${theme.borderLight}`,
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: theme.textMain,
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          </div>

          {/* 2.1 FORM VIEW: When Clicking on Row or New */}
          {journalViewMode === 'form' ? (
            <div
              style={{
                backgroundColor: theme.bgSubtle,
                border: `1px solid ${theme.borderLight}`,
                borderRadius: '10px',
                padding: '1.8rem 2rem',
                maxWidth: '680px',
                margin: '0 auto',
              }}
            >
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: theme.textMain, marginBottom: '1.2rem' }}>
                {editingJournalId ? 'Edit Journal' : 'Create New Journal'}
              </h2>

              <form onSubmit={handleConfirmJournalSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {/* Journal Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: theme.textMuted }}>
                    Journal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sales, Purchase, Bank, Cash"
                    value={journalFormData.name}
                    onChange={(e) => setJournalFormData({ ...journalFormData, name: e.target.value })}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderLight}`,
                      backgroundColor: theme.bgInput,
                      color: theme.textMain,
                      fontSize: '0.86rem',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Journal Type (Selection from Sales, Purchase, Bank, Cash) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: theme.textMuted }}>
                    Journal Type * (Select from Sales, Purchase, Bank, Cash)
                  </label>
                  <select
                    value={journalFormData.type}
                    onChange={(e) => setJournalFormData({ ...journalFormData, type: e.target.value })}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderLight}`,
                      backgroundColor: theme.bgInput,
                      color: theme.textMain,
                      fontSize: '0.86rem',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="Sales">Sales</option>
                    <option value="Purchase">Purchase</option>
                    <option value="Bank">Bank</option>
                    <option value="Cash">Cash</option>
                    <option value="General">General</option>
                  </select>
                </div>

                {/* Default Account */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: theme.textMuted }}>
                    Default Account *
                  </label>
                  <select
                    value={journalFormData.defaultAccount}
                    onChange={(e) => {
                      const selectedAcc = (chartOfAccounts || []).find((a) => a.name === e.target.value);
                      setJournalFormData({
                        ...journalFormData,
                        defaultAccount: e.target.value,
                        defaultAccountId: selectedAcc?.id || '',
                      });
                    }}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderLight}`,
                      backgroundColor: theme.bgInput,
                      color: theme.textMain,
                      fontSize: '0.86rem',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {(chartOfAccounts || []).map((acc) => (
                      <option key={acc.id || acc.code} value={acc.name}>
                        {acc.code} - {acc.name} ({acc.type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.6rem' }}>
                  <button
                    type="button"
                    onClick={() => setJournalViewMode('list')}
                    style={{
                      padding: '0.55rem 1.2rem',
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderLight}`,
                      backgroundColor: 'transparent',
                      color: theme.textMuted,
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.55rem 1.4rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: theme.accentGold,
                      color: '#0E0D0C',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Save Journal
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* 2.2 LIST VIEW: Journals Table */
            <div>
              {/* Search Bar */}
              <div style={{ position: 'relative', width: '320px', maxWidth: '100%', marginBottom: '1.2rem' }}>
                <Search
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: theme.textDim,
                  }}
                />
                <input
                  type="text"
                  placeholder="Search journals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.85rem 0.5rem 2.2rem',
                    borderRadius: '6px',
                    border: `1px solid ${theme.borderLight}`,
                    backgroundColor: theme.bgInput,
                    color: theme.textMain,
                    fontSize: '0.82rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto', border: `1px solid ${theme.borderLight}`, borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: theme.bgSubtle, borderBottom: `1px solid ${theme.borderLight}` }}>
                      <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Journal Name
                      </th>
                      <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Type
                      </th>
                      <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Default Account
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJournals.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ padding: '2.5rem', textAlign: 'center', color: theme.textMuted }}>
                          No journals found.
                        </td>
                      </tr>
                    ) : (
                      filteredJournals.map((jrn) => (
                        <tr
                          key={jrn.id}
                          onClick={() => handleEditJournalRow(jrn)}
                          style={{
                            borderBottom: `1px solid ${theme.borderLight}`,
                            cursor: 'pointer',
                            transition: 'background-color 0.12s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.bgSubtle)}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <td style={{ padding: '0.95rem 1.2rem', fontWeight: 600, color: theme.accentGold }}>
                            {jrn.name}
                          </td>
                          <td style={{ padding: '0.95rem 1.2rem', color: theme.textMain }}>
                            <span
                              style={{
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                backgroundColor: theme.bgSubtle,
                                border: `1px solid ${theme.borderLight}`,
                                fontSize: '0.76rem',
                                fontWeight: 600,
                              }}
                            >
                              {jrn.type}
                            </span>
                          </td>
                          <td style={{ padding: '0.95rem 1.2rem', color: theme.textMain }}>
                            {jrn.defaultAccount || 'Sales Income A/c'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODULE 3: JOURNAL ENTRIES (LIST VIEW & POST FORM VIEW)
          ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'journal-entries' && (
        <div
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.borderLight}`,
            borderRadius: '12px',
            padding: '1.8rem',
            boxShadow: theme.shadow,
          }}
        >
          {/* Header Action Bar: [New] ... [Back] in List Mode */}
          {jeViewMode === 'list' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '1.2rem',
                borderBottom: `1px solid ${theme.borderLight}`,
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <button
                type="button"
                onClick={handleNewJeClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.55rem 1.3rem',
                  backgroundColor: theme.accentGold,
                  color: '#0E0D0C',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} />
                <span>New</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.55rem 1rem',
                  backgroundColor: theme.bgSubtle,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: theme.textMain,
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            </div>
          )}

          {/* 3.1 FORM VIEW: When Clicking on New (Post Journal Entry View) */}
          {jeViewMode === 'form' ? (
            <div>
              {/* Header Action Bar: [Post] [Cancel] [Back] */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '1.2rem',
                  borderBottom: `1px solid ${theme.borderLight}`,
                  marginBottom: '1.5rem',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <button
                    type="button"
                    onClick={handlePostJe}
                    disabled={isUnbalanced}
                    style={{
                      padding: '0.55rem 1.4rem',
                      backgroundColor: isUnbalanced ? theme.bgSubtle : theme.accentGold,
                      color: isUnbalanced ? theme.textDim : '#0E0D0C',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: isUnbalanced ? 'not-allowed' : 'pointer',
                      opacity: isUnbalanced ? 0.6 : 1,
                    }}
                  >
                    Post
                  </button>

                  <button
                    type="button"
                    onClick={() => setJeViewMode('list')}
                    style={{
                      padding: '0.55rem 1.2rem',
                      backgroundColor: theme.bgSubtle,
                      color: theme.textMain,
                      border: `1px solid ${theme.borderLight}`,
                      borderRadius: '6px',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setJeViewMode('list')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.55rem 1rem',
                    backgroundColor: theme.bgSubtle,
                    border: `1px solid ${theme.borderLight}`,
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: theme.textMain,
                    cursor: 'pointer',
                  }}
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
              </div>

              {/* Form Header Fields: Accounting Date & Journal */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '1.8rem',
                  backgroundColor: theme.bgSubtle,
                  padding: '1.4rem',
                  borderRadius: '8px',
                  border: `1px solid ${theme.borderLight}`,
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.textMuted, marginBottom: '0.4rem' }}>
                    Accounting Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={jeFormData.accountingDate}
                    onChange={(e) => setJeFormData({ ...jeFormData, accountingDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderLight}`,
                      backgroundColor: theme.bgInput,
                      color: theme.textMain,
                      fontSize: '0.86rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.textMuted, marginBottom: '0.4rem' }}>
                    Journal *
                  </label>
                  <select
                    value={jeFormData.journal}
                    onChange={(e) => setJeFormData({ ...jeFormData, journal: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderLight}`,
                      backgroundColor: theme.bgInput,
                      color: theme.textMain,
                      fontSize: '0.86rem',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {(journals || []).map((jrn) => (
                      <option key={jrn.id} value={jrn.name}>
                        {jrn.name} ({jrn.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Lines Table */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: theme.textMain, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Journal Voucher Lines
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddJeLine}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.4rem 0.8rem',
                      backgroundColor: theme.bgSubtle,
                      color: theme.accentGold,
                      border: `1px solid ${theme.accentGold}`,
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={13} />
                    <span>+ Add a line</span>
                  </button>
                </div>

                <div style={{ overflowX: 'auto', border: `1px solid ${theme.borderLight}`, borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: theme.bgSubtle, borderBottom: `1px solid ${theme.borderLight}` }}>
                        <th style={{ padding: '0.75rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>
                          Account
                        </th>
                        <th style={{ padding: '0.75rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>
                          Partner / Contact
                        </th>
                        <th style={{ padding: '0.75rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', width: '160px', textAlign: 'right' }}>
                          Debit (₹)
                        </th>
                        <th style={{ padding: '0.75rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', width: '160px', textAlign: 'right' }}>
                          Credit (₹)
                        </th>
                        <th style={{ width: '45px', padding: '0.75rem 0.5rem' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {jeFormData.lines.map((line) => (
                        <tr key={line.id} style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
                          {/* Account Dropdown */}
                          <td style={{ padding: '0.65rem 1rem' }}>
                            <select
                              value={line.account}
                              onChange={(e) => handleJeLineChange(line.id, 'account', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.5rem 0.65rem',
                                borderRadius: '4px',
                                border: `1px solid ${theme.borderLight}`,
                                backgroundColor: theme.bgInput,
                                color: theme.textMain,
                                fontSize: '0.82rem',
                                outline: 'none',
                              }}
                            >
                              {(chartOfAccounts || []).map((acc) => (
                                <option key={acc.id || acc.code} value={acc.name}>
                                  {acc.code} - {acc.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Partner Dropdown */}
                          <td style={{ padding: '0.65rem 1rem' }}>
                            <select
                              value={line.partner}
                              onChange={(e) => handleJeLineChange(line.id, 'partner', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.5rem 0.65rem',
                                borderRadius: '4px',
                                border: `1px solid ${theme.borderLight}`,
                                backgroundColor: theme.bgInput,
                                color: theme.textMain,
                                fontSize: '0.82rem',
                                outline: 'none',
                              }}
                            >
                              <option value="-">None / Self</option>
                              {(contacts || []).map((cnt) => (
                                <option key={cnt.id} value={cnt.name}>
                                  {cnt.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Debit Input */}
                          <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>
                            <input
                              type="number"
                              min="0"
                              placeholder="0.00"
                              value={line.debit}
                              onChange={(e) => handleJeLineChange(line.id, 'debit', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.5rem 0.65rem',
                                borderRadius: '4px',
                                border: `1px solid ${theme.borderLight}`,
                                backgroundColor: theme.bgInput,
                                color: theme.textMain,
                                fontSize: '0.84rem',
                                fontWeight: Number(line.debit) > 0 ? 700 : 400,
                                textAlign: 'right',
                                outline: 'none',
                              }}
                            />
                          </td>

                          {/* Credit Input */}
                          <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>
                            <input
                              type="number"
                              min="0"
                              placeholder="0.00"
                              value={line.credit}
                              onChange={(e) => handleJeLineChange(line.id, 'credit', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.5rem 0.65rem',
                                borderRadius: '4px',
                                border: `1px solid ${theme.borderLight}`,
                                backgroundColor: theme.bgInput,
                                color: theme.textMain,
                                fontSize: '0.84rem',
                                fontWeight: Number(line.credit) > 0 ? 700 : 400,
                                textAlign: 'right',
                                outline: 'none',
                              }}
                            />
                          </td>

                          {/* Remove Line */}
                          <td style={{ padding: '0.65rem 0.5rem', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveJeLine(line.id)}
                              title="Remove Line"
                              style={{
                                background: 'none',
                                border: 'none',
                                color: theme.textDim,
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {/* Totals Row */}
                      <tr style={{ backgroundColor: theme.bgSubtle, fontWeight: 700 }}>
                        <td colSpan={2} style={{ padding: '0.75rem 1rem', textAlign: 'right', color: theme.textMain }}>
                          Total:
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: theme.accentGold, fontSize: '0.9rem' }}>
                          ₹{totalDebit.toLocaleString()}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: theme.accentGold, fontSize: '0.9rem' }}>
                          ₹{totalCredit.toLocaleString()}
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ⚠️ BLOCKING WARNING (when debit and credit do not match) */}
              {isUnbalanced ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem 1.2rem',
                    backgroundColor: theme.errorBg,
                    border: `1px solid ${theme.error}`,
                    borderRadius: '8px',
                    color: theme.error,
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    marginBottom: '1.2rem',
                  }}
                >
                  <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Blocking Warning:</strong> Debit amount (₹{totalDebit.toLocaleString()}) and Credit amount (₹{totalCredit.toLocaleString()}) do not match! The transaction must be balanced before posting.
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.85rem 1.2rem',
                    backgroundColor: theme.successBg,
                    border: `1px solid ${theme.success}`,
                    borderRadius: '8px',
                    color: theme.success,
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    marginBottom: '1.2rem',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Entry is balanced! Ready to post to General Ledger.</span>
                </div>
              )}

              {/* Field Explanation Note box matching diagram */}
              <div
                style={{
                  backgroundColor: theme.bgSubtle,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '8px',
                  padding: '1rem 1.2rem',
                  fontSize: '0.78rem',
                  color: theme.textMuted,
                  lineHeight: '1.5',
                }}
              >
                <strong style={{ color: theme.accentGold, display: 'block', marginBottom: '0.3rem' }}>
                  Field Explanation:
                </strong>
                • <strong>Account</strong> - Selection From Chart of Accounts (Many to one)<br />
                • <strong>Partner</strong> - Selection from contact master (Many to one)<br />
                • <strong>The Transaction would be connected through chart of accounts.</strong>
              </div>
            </div>
          ) : (
            /* 3.2 LIST VIEW: Journal Entries Table */
            <div>
              {/* Search Bar */}
              <div style={{ position: 'relative', width: '320px', maxWidth: '100%', marginBottom: '1.2rem' }}>
                <Search
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: theme.textDim,
                  }}
                />
                <input
                  type="text"
                  placeholder="Search journal entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.85rem 0.5rem 2.2rem',
                    borderRadius: '6px',
                    border: `1px solid ${theme.borderLight}`,
                    backgroundColor: theme.bgInput,
                    color: theme.textMain,
                    fontSize: '0.82rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto', border: `1px solid ${theme.borderLight}`, borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: theme.bgSubtle, borderBottom: `1px solid ${theme.borderLight}` }}>
                      <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Date
                      </th>
                      <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Number
                      </th>
                      <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Partner
                      </th>
                      <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Journal
                      </th>
                      <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>
                        Total
                      </th>
                      <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJournalEntries.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: theme.textMuted }}>
                          No journal entries found.
                        </td>
                      </tr>
                    ) : (
                      filteredJournalEntries.map((je) => {
                        const isPosted = (je.status || '').toLowerCase() === 'posted';
                        const total = je.total || (je.lines || []).reduce((s, l) => s + (Number(l.debit) || 0), 0);

                        return (
                          <tr
                            key={je.id || je.number}
                            style={{
                              borderBottom: `1px solid ${theme.borderLight}`,
                            }}
                          >
                            <td style={{ padding: '0.95rem 1.2rem', color: theme.textMuted }}>
                              {je.displayDate || je.date}
                            </td>
                            <td style={{ padding: '0.95rem 1.2rem', fontWeight: 700, color: theme.accentGold, fontFamily: 'monospace' }}>
                              {je.number || je.id}
                            </td>
                            <td style={{ padding: '0.95rem 1.2rem', fontWeight: 600, color: theme.textMain }}>
                              {je.partner || '-'}
                            </td>
                            <td style={{ padding: '0.95rem 1.2rem', color: theme.textMain }}>
                              <span
                                style={{
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '4px',
                                  backgroundColor: theme.bgSubtle,
                                  border: `1px solid ${theme.borderLight}`,
                                  fontSize: '0.76rem',
                                  fontWeight: 600,
                                }}
                              >
                                {je.journal}
                              </span>
                            </td>
                            <td style={{ padding: '0.95rem 1.2rem', textAlign: 'right', fontWeight: 700, color: theme.textMain }}>
                              Rs. {Number(total).toLocaleString()}
                            </td>
                            <td style={{ padding: '0.95rem 1.2rem', textAlign: 'center' }}>
                              <span
                                style={{
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  padding: '0.25rem 0.65rem',
                                  borderRadius: '4px',
                                  backgroundColor: isPosted ? theme.successBg : theme.bgSubtle,
                                  color: isPosted ? theme.success : theme.textMuted,
                                  border: `1px solid ${isPosted ? theme.success : theme.borderLight}`,
                                }}
                              >
                                {je.status || (isPosted ? 'Posted' : 'Draft')}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
