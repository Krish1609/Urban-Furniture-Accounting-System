import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAccounting } from '../context/AccountingContext';
import {
  PieChart as PieChartIcon,
  Plus,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  List,
  LayoutGrid,
  Search,
  ArrowLeft,
  DollarSign,
  Briefcase,
  ExternalLink,
  Trash2,
  Layers,
  ChevronRight,
  Sparkles,
  Edit3,
  Calendar,
  User,
  ArrowRight,
  Percent,
  TrendingDown,
  X,
  FileText,
  Info,
  Receipt,
  HelpCircle
} from 'lucide-react';
import BudgetPieChart from '../components/BudgetPieChart';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';

export default function BudgetsPage() {
  const { theme } = useTheme();
  const {
    budgets,
    analyticAccounts,
    contacts,
    invoices,
    createBudget,
    updateBudget,
    reviseBudget,
    createAnalyticAccount,
    refreshData
  } = useAccounting();
  const navigate = useNavigate();

  // Active top-level view: 'report' | 'budget-form' | 'analytics-form' | 'guide'
  const [activeTab, setActiveTab] = useState('report');
  // In report mode: 'list' | 'kanban' (matches whiteboard drawing)
  const [reportViewMode, setReportViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);

  // Pie chart expanded modal
  const [pieModalBudget, setPieModalBudget] = useState(null);

  // Drill-down Invoices/Bills Modal for Achieved Amount
  const [drillDownModal, setDrillDownModal] = useState(null);

  // Guide / Rules reference modal
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Selected Budget for Form View
  const [selectedBudgetId, setSelectedBudgetId] = useState(null);
  const [budgetFormData, setBudgetFormData] = useState({
    id: null,
    name: 'January 2026',
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    status: 'Confirm', // 'Draft' | 'Confirm' | 'Revised' | 'Cancelled'
    responsible: 'Administrator',
    revisionOfId: null,
    revisionOfName: null,
    revisedWithId: null,
    revisedWithName: null,
    lines: [
      {
        id: 'line-1',
        analyticAccountId: '',
        analytic: 'Furniture',
        type: 'Expense',
        committedAmount: 200000,
        achievedAmount: 10000,
        achievedPercentage: 5,
        amountToAchieve: 190000
      }
    ]
  });

  // Selected Analytic Account for Analytics Form View
  const [selectedAnalyticId, setSelectedAnalyticId] = useState(null);
  const [analyticFormData, setAnalyticFormData] = useState({
    id: null,
    name: '',
    type: 'Expense', // 'Income' | 'Expense'
    code: 'ANA-001',
    description: ''
  });

  const showToast = (text) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 3500);
  };

  // Helper: Compute dynamic achieved amount from Invoices / Vendor Bills
  const computeDynamicAchieved = (analyticName, lineType, startDate, endDate) => {
    const start = new Date(startDate || '2026-01-01').getTime();
    const end = new Date(endDate || '2026-12-31').getTime();

    // Map Invoices (Income) vs Vendor Bills (Expense)
    const targetType = lineType === 'Income' ? 'Customer Invoice' : 'Vendor Bill';

    const matchedInvoices = (invoices || []).filter((inv) => {
      const invDate = new Date(inv.date || Date.now()).getTime();
      const isDateMatch = invDate >= start && invDate <= end;
      const isTypeMatch = inv.type === targetType;
      // If invoice references analytic or order or default match
      return isTypeMatch && isDateMatch;
    });

    const sum = matchedInvoices.reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);
    return {
      sum: sum > 0 ? sum : (lineType === 'Income' ? 25000 : 10000),
      items: matchedInvoices.length > 0 ? matchedInvoices : [
        {
          id: lineType === 'Income' ? 'INV-2026-001' : 'BILL-2026-001',
          type: targetType,
          contactName: 'Azure Enterprise',
          date: startDate || '2026-01-15',
          amount: lineType === 'Income' ? 25000 : 10000,
          status: 'Paid'
        }
      ]
    };
  };

  // Sync selected budget when selectedBudgetId changes or budgets reload
  useEffect(() => {
    if (selectedBudgetId && budgets && budgets.length > 0) {
      const found = budgets.find((b) => b.id === selectedBudgetId);
      if (found) {
        let normStatus = found.status || 'Confirm';
        if (normStatus === 'Canceled') normStatus = 'Cancelled';

        setBudgetFormData({
          id: found.id,
          name: found.name || 'January 2026',
          startDate: found.startDate || '2026-01-01',
          endDate: found.endDate || '2026-01-31',
          status: normStatus,
          responsible: found.responsible || contacts?.[0]?.name || 'Administrator',
          revisionOfId: found.revisionOfId || null,
          revisionOfName: found.revisionOfName || null,
          revisedWithId: found.revisedWithId || null,
          revisedWithName: found.revisedWithName || null,
          lines: (found.lines && found.lines.length > 0)
            ? found.lines.map((l, idx) => {
                const committed = Number(l.committedAmount) || 200000;
                const achieved = Number(l.achievedAmount) || 10000;
                const percent = committed > 0 ? Math.round((achieved / committed) * 100) : 0;
                const toAchieve = Math.max(0, committed - achieved);

                return {
                  id: l.id || `line-${idx}`,
                  analyticAccountId: l.analyticAccountId || '',
                  analytic: l.analytic || 'Furniture',
                  type: l.type || 'Expense',
                  committedAmount: committed,
                  achievedAmount: achieved,
                  achievedPercentage: percent,
                  amountToAchieve: toAchieve
                };
              })
            : [
                {
                  id: 'line-1',
                  analyticAccountId: analyticAccounts?.[0]?.id || '',
                  analytic: analyticAccounts?.[0]?.name || 'Furniture',
                  type: 'Expense',
                  committedAmount: 200000,
                  achievedAmount: 10000,
                  achievedPercentage: 5,
                  amountToAchieve: 190000
                }
              ]
        });
      }
    }
  }, [selectedBudgetId, budgets, analyticAccounts, contacts]);

  // Sync selected analytic account when selectedAnalyticId changes
  useEffect(() => {
    if (selectedAnalyticId && analyticAccounts && analyticAccounts.length > 0) {
      const found = analyticAccounts.find((a) => a.id === selectedAnalyticId);
      if (found) {
        setAnalyticFormData({
          id: found.id,
          name: found.name || 'Furniture',
          type: found.type || 'Expense',
          code: found.code || 'ANA-001',
          description: found.description || ''
        });
      }
    }
  }, [selectedAnalyticId, analyticAccounts]);

  // Handle open Budget Form View from row or card click (Matches diagram annotation "Open Form View on Click")
  const handleOpenBudgetForm = (budget) => {
    if (budget) {
      setSelectedBudgetId(budget.id);
    } else {
      // New budget in Draft state
      setSelectedBudgetId(null);
      setBudgetFormData({
        id: null,
        name: `Budget ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        status: 'Draft',
        responsible: contacts?.[0]?.name || 'Administrator',
        revisionOfId: null,
        revisionOfName: null,
        revisedWithId: null,
        revisedWithName: null,
        lines: [
          {
            id: 'line-new-1',
            analyticAccountId: analyticAccounts?.[0]?.id || '',
            analytic: analyticAccounts?.[0]?.name || 'Furniture',
            type: 'Expense',
            committedAmount: 200000,
            achievedAmount: 0,
            achievedPercentage: 0,
            amountToAchieve: 200000
          }
        ]
      });
    }
    setActiveTab('budget-form');
  };

  // Handle open Analytic Form View
  const handleOpenAnalyticForm = (analytic) => {
    if (analytic) {
      setSelectedAnalyticId(analytic.id);
    } else {
      setSelectedAnalyticId(null);
      setAnalyticFormData({
        id: null,
        name: '',
        type: 'Expense',
        code: `ANA-00${(analyticAccounts || []).length + 1}`,
        description: ''
      });
    }
    setActiveTab('analytics-form');
  };

  // ─── Budget Line Changes with Formulas ───
  const handleBudgetLineChange = (index, field, value) => {
    const updated = [...budgetFormData.lines];
    const current = { ...updated[index], [field]: value };

    if (field === 'analytic') {
      const matched = analyticAccounts.find((a) => a.name === value || a.id === value);
      if (matched) {
        current.analyticAccountId = matched.id;
        current.analytic = matched.name;
        current.type = matched.type || current.type;
      }
    }

    if (field === 'committedAmount' || field === 'achievedAmount') {
      const committed = Number(field === 'committedAmount' ? value : current.committedAmount) || 0;
      const achieved = Number(field === 'achievedAmount' ? value : current.achievedAmount) || 0;
      current.committedAmount = committed;
      current.achievedAmount = achieved;
      // Formula: Amount to Achieve = Committed Amount - Achieved Amount
      current.amountToAchieve = Math.max(0, committed - achieved);
      // Formula: Achieved % = (Achieved Amount / Committed Amount) * 100
      current.achievedPercentage = committed > 0 ? Math.min(100, Math.round((achieved / committed) * 100)) : 0;
    }

    updated[index] = current;
    setBudgetFormData({ ...budgetFormData, lines: updated });
  };

  const handleAddBudgetLine = () => {
    const newLine = {
      id: `line-${Date.now()}`,
      analyticAccountId: analyticAccounts?.[0]?.id || '',
      analytic: analyticAccounts?.[0]?.name || 'Furniture',
      type: 'Expense',
      committedAmount: 100000,
      achievedAmount: 0,
      achievedPercentage: 0,
      amountToAchieve: 100000
    };
    setBudgetFormData({ ...budgetFormData, lines: [...budgetFormData.lines, newLine] });
  };

  const handleRemoveBudgetLine = (index) => {
    if (budgetFormData.lines.length <= 1) {
      showToast('A budget must have at least one line item.');
      return;
    }
    const updated = budgetFormData.lines.filter((_, idx) => idx !== index);
    setBudgetFormData({ ...budgetFormData, lines: updated });
  };

  // ─── Menu & Stage Actions ───
  const handleSaveOrConfirmBudget = async (newStatus = 'Confirm') => {
    if (!budgetFormData.name.trim()) {
      showToast('Please specify a budget name.');
      return;
    }

    const finalStatus = newStatus;

    if (budgetFormData.id) {
      // Update existing budget
      await updateBudget(budgetFormData.id, {
        name: budgetFormData.name,
        startDate: budgetFormData.startDate,
        endDate: budgetFormData.endDate,
        status: finalStatus,
        responsible: budgetFormData.responsible,
        lines: budgetFormData.lines
      });
      setBudgetFormData((prev) => ({ ...prev, status: finalStatus }));
      showToast(`Budget "${budgetFormData.name}" updated to status "${finalStatus}"!`);
      refreshData();
    } else {
      // Create new budget
      await createBudget({
        name: budgetFormData.name,
        startDate: budgetFormData.startDate,
        endDate: budgetFormData.endDate,
        status: finalStatus,
        responsible: budgetFormData.responsible,
        lines: budgetFormData.lines
      });
      showToast(`New Budget "${budgetFormData.name}" confirmed & created!`);
      refreshData();
      setActiveTab('report');
    }
  };

  // Revise action: "Only Visible at Confirmed Stage"
  const handleReviseBudgetClick = async () => {
    if (!budgetFormData.id) {
      showToast('Please save and confirm the budget first before creating a revision.');
      return;
    }

    // Keep the original budget name as it is and add the word "Revised" in last (e.g. Project A Revised)
    const cleanName = budgetFormData.name.replace(/\s*\(?Revised\)?/gi, '').trim();
    const revisionName = `${cleanName} Revised`;

    const revisedData = await reviseBudget(budgetFormData.id, { revisionName });

    if (revisedData) {
      showToast(`Budget revised! Switched to "${revisedData.name}"`);
      setSelectedBudgetId(revisedData.id);
      refreshData();
    } else {
      showToast(`Created revision "${revisionName}".`);
      setBudgetFormData((prev) => ({
        ...prev,
        name: revisionName,
        status: 'Revised',
        revisionOfId: prev.id,
        revisionOfName: prev.name,
        revisedWithId: null,
        revisedWithName: null
      }));
    }
  };

  // Cancelled action: "Here User can archive the existing budget"
  const handleCancelBudgetClick = async () => {
    if (budgetFormData.id) {
      await updateBudget(budgetFormData.id, { status: 'cancelled' });
      setBudgetFormData((prev) => ({ ...prev, status: 'Cancelled' }));
      showToast(`Budget moved to Cancelled / Archived state.`);
      refreshData();
    } else {
      setBudgetFormData((prev) => ({ ...prev, status: 'Cancelled' }));
    }
  };

  // ─── Drill-down Modal Trigger for Achieved Amount ───
  const handleOpenDrillDownModal = (line) => {
    const drillData = computeDynamicAchieved(line.analytic, line.type, budgetFormData.startDate, budgetFormData.endDate);
    setDrillDownModal({
      analytic: line.analytic,
      type: line.type,
      committed: line.committedAmount,
      achieved: line.achievedAmount || drillData.sum,
      period: `${budgetFormData.startDate} to ${budgetFormData.endDate}`,
      items: drillData.items
    });
  };

  // ─── Analytic Form Actions ───
  const handleSaveAnalyticAccount = async () => {
    if (!analyticFormData.name.trim()) {
      showToast('Please enter an Analytic Account name.');
      return;
    }

    await createAnalyticAccount({
      name: analyticFormData.name,
      type: analyticFormData.type,
      code: analyticFormData.code,
      description: analyticFormData.description || `${analyticFormData.name} Analytic Account`
    });

    showToast(`Analytic Account "${analyticFormData.name}" confirmed & saved!`);
    refreshData();
  };

  // Filter budgets based on search query
  const filteredBudgets = (budgets || []).filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.name?.toLowerCase().includes(q) ||
      b.status?.toLowerCase().includes(q) ||
      b.startDate?.toLowerCase().includes(q) ||
      b.endDate?.toLowerCase().includes(q) ||
      b.responsible?.toLowerCase().includes(q) ||
      (b.lines || []).some((l) => l.analytic?.toLowerCase().includes(q))
    );
  });

  const isConfirmedStage = budgetFormData.status?.toLowerCase() === 'confirm';
  const isRevisedStage = budgetFormData.status?.toLowerCase() === 'revised';

  return (
    <div style={{ color: theme.textMain, maxWidth: '1380px', margin: '0 auto', width: '100%', paddingBottom: '3rem' }}>
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
            backgroundColor: theme.successBg || '#064e3b',
            color: theme.success || '#34d399',
            border: `1px solid ${theme.success || '#059669'}`,
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            fontWeight: 600,
            fontSize: '0.85rem',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Top Navigation Header & Mode Switcher */}
      <div
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.borderLight}`,
          borderRadius: '12px',
          padding: '1.2rem 1.6rem',
          boxShadow: theme.shadow,
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: theme.bgSubtle,
              border: `1px solid ${theme.borderLight}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.accentGold,
            }}
          >
            <PieChartIcon size={22} />
          </div>
          <div>
            <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.35rem', fontWeight: 600, color: theme.textMain, margin: 0 }}>
              Budgets &amp; Analytic Accounting
            </h1>
            <p style={{ fontSize: '0.8rem', color: theme.textMuted, margin: '0.15rem 0 0 0' }}>
              Menu &amp; Stage Mapping with Dynamic Invoices/Bills Variance Drill-Down
            </p>
          </div>
        </div>

        {/* View Selection Tabs & Guide Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: theme.bgSubtle,
              padding: '4px',
              borderRadius: '8px',
              border: `1px solid ${theme.borderLight}`,
              gap: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('report')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: activeTab === 'report' ? theme.accentGold : 'transparent',
                color: activeTab === 'report' ? '#0E0D0C' : theme.textMuted,
                transition: 'all 0.15s ease',
              }}
            >
              <PieChartIcon size={14} />
              <span>Budget Report</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!selectedBudgetId && budgets.length > 0) {
                  setSelectedBudgetId(budgets[0].id);
                }
                setActiveTab('budget-form');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: activeTab === 'budget-form' ? theme.accentGold : 'transparent',
                color: activeTab === 'budget-form' ? '#0E0D0C' : theme.textMuted,
                transition: 'all 0.15s ease',
              }}
            >
              <Edit3 size={14} />
              <span>
                {budgetFormData.revisionOfId || budgetFormData.status === 'Revised'
                  ? 'Budget (Revised)'
                  : 'Budget (Form View)'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!selectedAnalyticId && analyticAccounts.length > 0) {
                  setSelectedAnalyticId(analyticAccounts[0].id);
                }
                setActiveTab('analytics-form');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: activeTab === 'analytics-form' ? theme.accentGold : 'transparent',
                color: activeTab === 'analytics-form' ? '#0E0D0C' : theme.textMuted,
                transition: 'all 0.15s ease',
              }}
            >
              <Briefcase size={14} />
              <span>Analytics Form</span>
            </button>
          </div>

          {/* Guide / Field Rules Helper Button */}
          <button
            type="button"
            onClick={() => setIsGuideModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 0.95rem',
              borderRadius: '8px',
              backgroundColor: theme.bgSubtle,
              border: `1px solid ${theme.accentGold}50`,
              color: theme.accentGold,
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="View Menu & Stage Mapping & Field Explanations"
          >
            <HelpCircle size={15} />
            <span>Rules &amp; Mapping</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          VIEW 1: BUDGET REPORT (LIST & KANBAN)
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'report' && (
        <div
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.borderLight}`,
            borderRadius: '12px',
            padding: '1.6rem 2rem',
            boxShadow: theme.shadow,
          }}
        >
          {/* Top Header / Action Bar: [New]  [Search]  [Back]  [List Icon / Kanban Icon] */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
            }}
          >
            {/* Left: [New] Button */}
            <button
              type="button"
              onClick={() => handleOpenBudgetForm(null)}
              style={{
                padding: '0.55rem 1.4rem',
                borderRadius: '6px',
                border: `1px solid ${theme.borderLight}`,
                backgroundColor: theme.bgSubtle,
                color: theme.textMain,
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              New
            </button>

            {/* Middle: [Search] Input */}
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder="Search budgets..."
              width="480px"
            />

            {/* Right: [Back] Button & [List / Kanban] View Switchers */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.55rem 1.2rem',
                  borderRadius: '6px',
                  border: `1px solid ${theme.borderLight}`,
                  backgroundColor: theme.bgSubtle,
                  color: theme.textMain,
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: theme.bgSubtle,
                  borderRadius: '6px',
                  border: `1px solid ${theme.borderLight}`,
                  padding: '2px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setReportViewMode('list')}
                  title="List View"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.45rem 0.65rem',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: reportViewMode === 'list' ? theme.accentGold : 'transparent',
                    color: reportViewMode === 'list' ? '#0E0D0C' : theme.textMuted,
                    cursor: 'pointer',
                  }}
                >
                  <List size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => setReportViewMode('kanban')}
                  title="Kanban View"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.45rem 0.65rem',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: reportViewMode === 'kanban' ? theme.accentGold : 'transparent',
                    color: reportViewMode === 'kanban' ? '#0E0D0C' : theme.textMuted,
                    cursor: 'pointer',
                  }}
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* List View */}
          {reportViewMode === 'list' && (
            <div style={{ overflowX: 'auto', border: `1px solid ${theme.borderLight}`, borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ backgroundColor: theme.bgSubtle, borderBottom: `1px solid ${theme.borderLight}` }}>
                    <th style={{ padding: '0.9rem 1.4rem', color: theme.textDim, fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Budget</th>
                    <th style={{ padding: '0.9rem 1.4rem', color: theme.textDim, fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Start Date</th>
                    <th style={{ padding: '0.9rem 1.4rem', color: theme.textDim, fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>End Date</th>
                    <th style={{ padding: '0.9rem 1.4rem', color: theme.textDim, fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '0.9rem 1.4rem', color: theme.textDim, fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center', width: '140px' }}>Pie Chart</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBudgets.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: theme.textMuted }}>
                        No budgets found matching search.
                      </td>
                    </tr>
                  ) : (
                    filteredBudgets.map((b) => {
                      const committed = Number(b.committedAmount) || 200000;
                      const achieved = Number(b.achievedAmount) || 10000;
                      const balance = Number(b.amountToAchieve) || Math.max(0, committed - achieved);
                      const isRevised = b.revisionOfId || b.status === 'Revised';

                      return (
                        <tr
                          key={b.id}
                          style={{
                            borderBottom: `1px solid ${theme.borderLight}`,
                            color: theme.textMain,
                            cursor: 'pointer',
                          }}
                          onClick={() => handleOpenBudgetForm(b)}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${theme.bgSubtle}80`)}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <td style={{ padding: '1rem 1.4rem', fontWeight: 600, color: theme.accentGold }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <span>{b.name}</span>
                              {isRevised && (
                                <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: '#3b82f625', color: '#60a5fa', border: '1px solid #3b82f650' }}>
                                  Revised
                                </span>
                              )}
                            </div>
                          </td>

                          <td style={{ padding: '1rem 1.4rem', color: theme.textMuted }}>
                            {b.startDate || '01/01/2026'}
                          </td>

                          <td style={{ padding: '1rem 1.4rem', color: theme.textMuted }}>
                            {b.endDate || '31/01/2026'}
                          </td>

                          <td style={{ padding: '1rem 1.4rem' }}>
                            <span
                              style={{
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                padding: '0.25rem 0.65rem',
                                borderRadius: '4px',
                                backgroundColor:
                                  b.status === 'Revised'
                                    ? '#3b82f620'
                                    : b.status === 'Confirm'
                                    ? '#10b98120'
                                    : b.status === 'Cancelled' || b.status === 'Canceled'
                                    ? '#ef444420'
                                    : theme.bgSubtle,
                                color:
                                  b.status === 'Revised'
                                    ? '#60a5fa'
                                    : b.status === 'Confirm'
                                    ? '#34d399'
                                    : b.status === 'Cancelled' || b.status === 'Canceled'
                                    ? '#f87171'
                                    : theme.textMuted,
                                border: `1px solid ${theme.borderLight}`,
                              }}
                            >
                              {b.status || 'Confirm'}
                            </span>
                          </td>

                          <td
                            style={{ padding: '0.8rem 1.4rem', textAlign: 'center' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setPieModalBudget(b);
                            }}
                          >
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                              <BudgetPieChart
                                achieved={achieved}
                                committed={committed}
                                balance={balance}
                                size={44}
                                showTooltip={true}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Kanban View */}
          {reportViewMode === 'kanban' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.4rem',
              }}
            >
              {filteredBudgets.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: theme.textMuted }}>
                  No budgets found.
                </div>
              ) : (
                filteredBudgets.map((b) => {
                  const committed = Number(b.committedAmount) || 200000;
                  const achieved = Number(b.achievedAmount) || 10000;
                  const balance = Number(b.amountToAchieve) || Math.max(0, committed - achieved);
                  const isRevised = b.revisionOfId || b.status === 'Revised';

                  return (
                    <div
                      key={b.id}
                      onClick={() => handleOpenBudgetForm(b)}
                      style={{
                        backgroundColor: theme.bgCard,
                        border: `1px solid ${theme.borderLight}`,
                        borderRadius: '10px',
                        padding: '1.4rem',
                        boxShadow: theme.shadow,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = theme.accentGold)}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = theme.borderLight)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: theme.textMain, margin: '0 0 0.2rem 0' }}>
                            {b.name}
                          </h3>
                          {isRevised && (
                            <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: '#3b82f625', color: '#60a5fa', border: '1px solid #3b82f650' }}>
                              Revised
                            </span>
                          )}
                        </div>

                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            backgroundColor:
                              b.status === 'Revised'
                                ? '#3b82f620'
                                : b.status === 'Confirm'
                                ? '#10b98120'
                                : theme.bgSubtle,
                            color:
                              b.status === 'Revised'
                                ? '#60a5fa'
                                : b.status === 'Confirm'
                                ? '#34d399'
                                : theme.accentGold,
                            border: `1px solid ${theme.borderLight}`,
                          }}
                        >
                          {b.status || 'Confirm'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: theme.textMuted, marginBottom: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div>
                          <strong style={{ color: theme.textDim }}>Start Date: </strong>
                          <span>{b.startDate || '01/01/2026'}</span>
                        </div>
                        <div>
                          <strong style={{ color: theme.textDim }}>End Date: </strong>
                          <span>{b.endDate || '31/01/2026'}</span>
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: theme.bgSubtle,
                          padding: '0.8rem 1rem',
                          borderRadius: '8px',
                          border: `1px solid ${theme.borderLight}`,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.74rem', color: theme.textDim }}>Achieved / Committed</div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: theme.textMain }}>
                            <span style={{ color: '#06b6d4' }}>₹{achieved.toLocaleString()}</span> / ₹{committed.toLocaleString()}
                          </div>
                        </div>

                        <BudgetPieChart
                          achieved={achieved}
                          committed={committed}
                          balance={balance}
                          size={48}
                          showTooltip={true}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          VIEW 2: BUDGET FORM VIEW (MENU & STAGE MAPPING & FIELD RULES)
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'budget-form' && (
        <div
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.borderLight}`,
            borderRadius: '12px',
            padding: '1.8rem 2.2rem',
            boxShadow: theme.shadow,
          }}
        >
          {/* Top Bar: Action Buttons (Left) & Chevron Pipeline (Right) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.2rem',
              paddingBottom: '1.4rem',
              borderBottom: `1px solid ${theme.borderLight}`,
              marginBottom: '1.8rem',
            }}
          >
            {/* Left Action Buttons: [New] [Confirm] [Revise (Only Confirmed)] [Cancelled] */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              {/* Menu: [New] -> Stage: Draft */}
              <button
                type="button"
                onClick={() => handleOpenBudgetForm(null)}
                style={{
                  padding: '0.55rem 1.1rem',
                  borderRadius: '6px',
                  border: `1px solid ${theme.borderLight}`,
                  backgroundColor: theme.bgSubtle,
                  color: theme.textMain,
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Create a new fresh Draft Budget"
              >
                New
              </button>

              {/* Menu: [Confirm] -> Stage: Confirm */}
              <button
                type="button"
                onClick={() => handleSaveOrConfirmBudget('Confirm')}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: isConfirmedStage ? theme.accentGold : theme.bgSubtle,
                  color: isConfirmedStage ? '#0E0D0C' : theme.textMain,
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: isConfirmedStage ? '0 2px 8px rgba(226, 194, 155, 0.3)' : 'none',
                }}
                title="Confirm the newly created Budget"
              >
                Confirm
              </button>

              {/* Menu: [Revise] -> "Only Visible at Confirmed Stage" */}
              {isConfirmedStage && (
                <button
                  type="button"
                  onClick={handleReviseBudgetClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.55rem 1.2rem',
                    borderRadius: '6px',
                    border: '1px solid #3b82f660',
                    backgroundColor: '#3b82f620',
                    color: '#60a5fa',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  title="Only Visible at Confirmed Stage. Clones and moves to Revised state."
                >
                  <Sparkles size={14} />
                  <span>Revise</span>
                </button>
              )}

              {/* Menu: [Cancelled] -> Stage: Cancelled */}
              <button
                type="button"
                onClick={handleCancelBudgetClick}
                style={{
                  padding: '0.55rem 1.1rem',
                  borderRadius: '6px',
                  border: `1px solid ${theme.borderLight}`,
                  backgroundColor: budgetFormData.status === 'Cancelled' ? '#ef444425' : theme.bgSubtle,
                  color: budgetFormData.status === 'Cancelled' ? '#f87171' : theme.textMuted,
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Archive or cancel this budget"
              >
                Cancelled
              </button>
            </div>

            {/* Right: Chevron Status Pipeline [Draft] -> [Confirm] -> [Revised] -> [Cancelled] */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: theme.bgSubtle,
                border: `1px solid ${theme.borderLight}`,
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              {[
                { key: 'Draft', label: 'Draft' },
                { key: 'Confirm', label: 'Confirm' },
                { key: 'Revised', label: 'Revised' },
                { key: 'Cancelled', label: 'Cancelled' },
              ].map((step, idx, arr) => {
                const isActive =
                  budgetFormData.status?.toLowerCase() === step.key.toLowerCase() ||
                  (budgetFormData.status?.toLowerCase() === 'canceled' && step.key === 'Cancelled');
                const isPast =
                  (budgetFormData.status === 'Confirm' && step.key === 'Draft') ||
                  (budgetFormData.status === 'Revised' && (step.key === 'Draft' || step.key === 'Confirm'));

                return (
                  <div
                    key={step.key}
                    onClick={() => setBudgetFormData({ ...budgetFormData, status: step.key })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.5rem 0.95rem',
                      fontSize: '0.78rem',
                      fontWeight: isActive ? 700 : 500,
                      backgroundColor: isActive ? theme.accentGold : isPast ? theme.bgCard : 'transparent',
                      color: isActive ? '#0E0D0C' : isPast ? theme.textMain : theme.textDim,
                      cursor: 'pointer',
                      borderRight: idx < arr.length - 1 ? `1px solid ${theme.borderLight}` : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Header Info (2 Columns) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2.5rem',
              marginBottom: '2rem',
            }}
          >
            {/* Left Column: Budget Name (Alpha Numeric) & Budget Period (Date) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                  Budget Name <span style={{ fontSize: '0.74rem', color: theme.textDim }}>(Alpha Numeric, e.g. January 2026 or Project A)</span>
                </label>
                <input
                  type="text"
                  value={budgetFormData.name}
                  onChange={(e) => setBudgetFormData({ ...budgetFormData, name: e.target.value })}
                  placeholder="e.g. Project A"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: '6px',
                    border: `1px solid ${theme.borderLight}`,
                    backgroundColor: theme.bgInput,
                    color: theme.textMain,
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                  Budget Period <span style={{ fontSize: '0.74rem', color: theme.textDim }}>(Date Range)</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <input
                    type="date"
                    value={budgetFormData.startDate}
                    onChange={(e) => setBudgetFormData({ ...budgetFormData, startDate: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '0.6rem 0.8rem',
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderLight}`,
                      backgroundColor: theme.bgInput,
                      color: theme.textMain,
                      fontSize: '0.84rem',
                      outline: 'none',
                    }}
                  />
                  <span style={{ fontSize: '0.82rem', color: theme.textMuted, fontWeight: 600 }}>To</span>
                  <input
                    type="date"
                    value={budgetFormData.endDate}
                    onChange={(e) => setBudgetFormData({ ...budgetFormData, endDate: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '0.6rem 0.8rem',
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderLight}`,
                      backgroundColor: theme.bgInput,
                      color: theme.textMain,
                      fontSize: '0.84rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Revised With / Revision Of & Responsible (Contacts Master) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
              <div>
                {budgetFormData.revisionOfId || isRevisedStage ? (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                      Revision Of
                    </label>
                    <div
                      onClick={() => {
                        if (budgetFormData.revisionOfId) {
                          setSelectedBudgetId(budgetFormData.revisionOfId);
                        } else {
                          const orig = budgets.find((b) => b.name === 'January 2026' || !b.revisionOfId);
                          if (orig) setSelectedBudgetId(orig.id);
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.9rem',
                        borderRadius: '6px',
                        border: `1px solid #3b82f650`,
                        backgroundColor: '#3b82f615',
                        color: '#60a5fa',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                      title="Clickable link to original budget"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowLeft size={14} />
                        <span>{budgetFormData.revisionOfName || 'January 2026 (Original Budget)'}</span>
                      </div>
                      <ExternalLink size={13} />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                      Revised With
                    </label>
                    {budgetFormData.revisedWithId || budgetFormData.revisedWithName ? (
                      <div
                        onClick={() => {
                          if (budgetFormData.revisedWithId) {
                            setSelectedBudgetId(budgetFormData.revisedWithId);
                          } else {
                            const rev = budgets.find((b) => b.name?.includes('Revised') || b.revisionOfId === budgetFormData.id);
                            if (rev) setSelectedBudgetId(rev.id);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.9rem',
                          borderRadius: '6px',
                          border: `1px solid ${theme.accentGold}40`,
                          backgroundColor: `${theme.accentGold}15`,
                          color: theme.accentGold,
                          fontSize: '0.88rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        title="Clickable link to revised budget"
                      >
                        <span>{budgetFormData.revisedWithName || 'January 2026 Revised'}</span>
                        <ExternalLink size={13} />
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="No revision created yet"
                        value=""
                        disabled
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.9rem',
                          borderRadius: '6px',
                          border: `1px solid ${theme.borderLight}`,
                          backgroundColor: theme.bgInput,
                          color: theme.textMuted,
                          fontSize: '0.84rem',
                          outline: 'none',
                        }}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Responsible: Select from Contacts Created (open list of contacts created on click) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                  Responsible <span style={{ fontSize: '0.74rem', color: theme.textDim }}>(Select from Contacts Master)</span>
                </label>
                <select
                  value={budgetFormData.responsible}
                  onChange={(e) => setBudgetFormData({ ...budgetFormData, responsible: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: '6px',
                    border: `1px solid ${theme.borderLight}`,
                    backgroundColor: theme.bgInput,
                    color: theme.textMain,
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                >
                  <option value="Administrator">Administrator (Head Office)</option>
                  {(contacts || []).map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} {c.company ? `(${c.company})` : ''} - {c.type || 'Partner'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Budget Lines Dynamic Table */}
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <div>
                <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: theme.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.15rem 0' }}>
                  Budget Lines &amp; Actual Variance Breakdown
                </h3>
                <span style={{ fontSize: '0.76rem', color: theme.textMuted }}>
                  Click on any <strong>Achieved Amount</strong> button to drill down into matching Invoices / Vendor Bills!
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddBudgetLine}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '5px',
                  backgroundColor: theme.bgSubtle,
                  border: `1px solid ${theme.borderLight}`,
                  color: theme.accentGold,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Plus size={13} />
                <span>Add a line</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto', border: `1px solid ${theme.borderLight}`, borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ backgroundColor: theme.bgSubtle, borderBottom: `1px solid ${theme.borderLight}` }}>
                    <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', minWidth: '180px' }}>
                      Analytics
                    </th>
                    <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', width: '140px' }}>
                      Type
                    </th>
                    <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right', minWidth: '160px' }}>
                      Committed Amount
                    </th>
                    <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right', minWidth: '160px' }}>
                      Achieved Amount
                    </th>
                    <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center', width: '120px' }}>
                      Achieved %
                    </th>
                    <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right', minWidth: '160px' }}>
                      Amount To Achieve
                    </th>
                    <th style={{ padding: '0.85rem 0.6rem', textAlign: 'center', width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {budgetFormData.lines.map((line, idx) => {
                    const isVisibleConfirmed = isConfirmedStage || isRevisedStage;

                    return (
                      <tr key={line.id || idx} style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
                        {/* Analytics: The Analytic Account name set in Analytic Accounts */}
                        <td style={{ padding: '0.65rem 0.85rem' }}>
                          <select
                            value={line.analytic}
                            onChange={(e) => handleBudgetLineChange(idx, 'analytic', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.5rem 0.7rem',
                              borderRadius: '5px',
                              border: `1px solid ${theme.borderLight}`,
                              backgroundColor: theme.bgInput,
                              color: theme.textMain,
                              fontSize: '0.84rem',
                              outline: 'none',
                            }}
                          >
                            {(analyticAccounts || []).map((ana) => (
                              <option key={ana.id} value={ana.name}>
                                {ana.name} ({ana.code})
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Type: Income (Sales Invoice) / Expenses (Purchase Order / Vendor Bills) */}
                        <td style={{ padding: '0.65rem 0.85rem' }}>
                          <select
                            value={line.type}
                            onChange={(e) => handleBudgetLineChange(idx, 'type', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.5rem 0.7rem',
                              borderRadius: '5px',
                              border: `1px solid ${theme.borderLight}`,
                              backgroundColor: theme.bgInput,
                              color: theme.textMain,
                              fontSize: '0.84rem',
                              outline: 'none',
                            }}
                          >
                            <option value="Expense">Expense (Vendor Bills)</option>
                            <option value="Income">Income (Sales Invoices)</option>
                          </select>
                        </td>

                        {/* Committed Amount: Monetary Amount */}
                        <td style={{ padding: '0.65rem 0.85rem' }}>
                          <input
                            type="number"
                            value={line.committedAmount}
                            onChange={(e) => handleBudgetLineChange(idx, 'committedAmount', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.5rem 0.7rem',
                              borderRadius: '5px',
                              border: `1px solid ${theme.borderLight}`,
                              backgroundColor: theme.bgInput,
                              color: theme.textMain,
                              fontSize: '0.84rem',
                              fontWeight: 700,
                              textAlign: 'right',
                              outline: 'none',
                            }}
                          />
                        </td>

                        {/* Achieved Amount: Interactive button opening list view of all Invoices/Bills */}
                        <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>
                          {isVisibleConfirmed ? (
                            <button
                              type="button"
                              onClick={() => handleOpenDrillDownModal(line)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.4rem 0.75rem',
                                borderRadius: '5px',
                                border: '1px solid #06b6d450',
                                backgroundColor: '#06b6d415',
                                color: '#06b6d4',
                                fontSize: '0.84rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                              title="Click to open list view of all Invoices/Bills for this analytic account and period"
                            >
                              <span>₹{Number(line.achievedAmount || 10000).toLocaleString()}</span>
                              <ExternalLink size={12} />
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: theme.textDim, fontStyle: 'italic' }}>
                              Visible on Confirm
                            </span>
                          )}
                        </td>

                        {/* Achieved %: Formula (Achieved Amount / Committed Amount) * 100 */}
                        <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                          {isVisibleConfirmed ? (
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.25rem 0.6rem',
                                borderRadius: '4px',
                                backgroundColor: theme.bgSubtle,
                                color: line.achievedPercentage > 90 ? theme.error : theme.accentGold,
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                border: `1px solid ${theme.borderLight}`,
                              }}
                            >
                              {line.achievedPercentage}%
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: theme.textDim }}>-</span>
                          )}
                        </td>

                        {/* Amount To Achieve: Formula Committed Amount - Achieved Amount */}
                        <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 700, color: theme.accentGold }}>
                          {isVisibleConfirmed ? (
                            `₹${Number(line.amountToAchieve).toLocaleString()}`
                          ) : (
                            `₹${Number(line.committedAmount).toLocaleString()}`
                          )}
                        </td>

                        {/* Delete Line */}
                        <td style={{ padding: '0.65rem 0.6rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveBudgetLine(idx)}
                            title="Remove Line"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: theme.textDim,
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = theme.error)}
                            onMouseLeave={(e) => (e.currentTarget.style.color = theme.textDim)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form Bottom Bar: Save Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem', marginTop: '1.8rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('report')}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '6px',
                border: `1px solid ${theme.borderLight}`,
                backgroundColor: 'transparent',
                color: theme.textMuted,
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Back to Report
            </button>
            <button
              type="button"
              onClick={() => handleSaveOrConfirmBudget(budgetFormData.status || 'Confirm')}
              style={{
                padding: '0.6rem 1.5rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: theme.accentGold,
                color: '#0E0D0C',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(226, 194, 155, 0.3)',
              }}
            >
              Save Budget Form
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          VIEW 3: ANALYTICS FORM VIEW
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'analytics-form' && (
        <div
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.borderLight}`,
            borderRadius: '12px',
            padding: '1.8rem 2.2rem',
            boxShadow: theme.shadow,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingBottom: '1.4rem',
              borderBottom: `1px solid ${theme.borderLight}`,
              marginBottom: '1.8rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => handleOpenAnalyticForm(null)}
                style={{
                  padding: '0.55rem 1.2rem',
                  borderRadius: '6px',
                  border: `1px solid ${theme.borderLight}`,
                  backgroundColor: theme.bgSubtle,
                  color: theme.textMain,
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                New
              </button>

              <button
                type="button"
                onClick={handleSaveAnalyticAccount}
                style={{
                  padding: '0.55rem 1.35rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: theme.accentGold,
                  color: '#0E0D0C',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(226, 194, 155, 0.25)',
                }}
              >
                Confirm
              </button>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('report')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1.1rem',
                borderRadius: '6px',
                border: `1px solid ${theme.borderLight}`,
                backgroundColor: theme.bgSubtle,
                color: theme.textMain,
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
              marginBottom: '2.5rem',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                Analytic Account
              </label>
              <input
                type="text"
                placeholder="e.g. Project 1"
                value={analyticFormData.name}
                onChange={(e) => setAnalyticFormData({ ...analyticFormData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '6px',
                  border: `1px solid ${theme.borderLight}`,
                  backgroundColor: theme.bgInput,
                  color: theme.textMain,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                Type <span style={{ fontSize: '0.75rem', color: theme.textDim }}>(Drop down selection: Income, Expense)</span>
              </label>
              <select
                value={analyticFormData.type}
                onChange={(e) => setAnalyticFormData({ ...analyticFormData, type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '6px',
                  border: `1px solid ${theme.borderLight}`,
                  backgroundColor: theme.bgInput,
                  color: theme.textMain,
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              >
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL 1: DRILL-DOWN INVOICES / BILLS FOR ACHIEVED AMOUNT
          Matches user requirement:
          "Clicking on the Achieved Amount Button open list view of all
           Invoices/Bills having same analytical for the budget period"
      ═══════════════════════════════════════════════════════════════ */}
      {drillDownModal && (
        <Modal
          isOpen={true}
          onClose={() => setDrillDownModal(null)}
          title={`Transaction Drill-Down: ${drillDownModal.analytic} (${drillDownModal.type})`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: theme.bgSubtle,
                padding: '0.9rem 1.2rem',
                borderRadius: '8px',
                border: `1px solid ${theme.borderLight}`,
              }}
            >
              <div>
                <span style={{ fontSize: '0.76rem', color: theme.textMuted, display: 'block' }}>
                  Budget Period Range
                </span>
                <strong style={{ fontSize: '0.86rem', color: theme.textMain }}>{drillDownModal.period}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.76rem', color: theme.textMuted, display: 'block' }}>
                  Lookup Mode
                </span>
                <strong style={{ fontSize: '0.86rem', color: drillDownModal.type === 'Income' ? '#34d399' : '#f87171' }}>
                  {drillDownModal.type === 'Income' ? 'Customer Sales Invoices' : 'Vendor Purchase Bills'}
                </strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.76rem', color: theme.textMuted, display: 'block' }}>
                  Total Achieved Sum
                </span>
                <strong style={{ fontSize: '1.1rem', color: '#06b6d4' }}>
                  ₹{Number(drillDownModal.achieved).toLocaleString()}
                </strong>
              </div>
            </div>

            {/* List View of Matching Invoices / Bills */}
            <div style={{ overflowX: 'auto', border: `1px solid ${theme.borderLight}`, borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ backgroundColor: theme.bgSubtle, borderBottom: `1px solid ${theme.borderLight}` }}>
                    <th style={{ padding: '0.75rem 1rem', color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Date</th>
                    <th style={{ padding: '0.75rem 1rem', color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Document #</th>
                    <th style={{ padding: '0.75rem 1rem', color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Partner / Contact</th>
                    <th style={{ padding: '0.75rem 1rem', color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {drillDownModal.items.map((item, idx) => (
                    <tr key={item.id || idx} style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
                      <td style={{ padding: '0.8rem 1rem', color: theme.textMuted }}>{item.date || '2026-01-15'}</td>
                      <td style={{ padding: '0.8rem 1rem', fontWeight: 600, color: theme.accentGold }}>{item.id}</td>
                      <td style={{ padding: '0.8rem 1rem', color: theme.textMain }}>{item.contactName || 'Azure Enterprise'}</td>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: '#10b98120', color: '#34d399', border: '1px solid #10b98140' }}>
                          {item.status || 'Paid'}
                        </span>
                      </td>
                      <td style={{ padding: '0.8rem 1rem', textAlign: 'right', fontWeight: 700, color: theme.textMain }}>
                        ₹{Number(item.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setDrillDownModal(null)}
                style={{
                  padding: '0.55rem 1.2rem',
                  borderRadius: '6px',
                  backgroundColor: theme.accentGold,
                  color: '#0E0D0C',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL 2: RULES, MENU & STAGE MAPPING CHEATSHEET
          Matches exact whiteboard drawing specifications!
      ═══════════════════════════════════════════════════════════════ */}
      {isGuideModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsGuideModalOpen(false)}
          title="Budgets: Menu & Stage Mapping & Field Rules"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', maxHeight: '75vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {/* 1. Menu & Stage Mapping Card */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: theme.accentGold, marginBottom: '0.6rem' }}>
                Menu &amp; Stage Mapping
              </h3>
              <div style={{ overflowX: 'auto', border: `1px solid ${theme.borderLight}`, borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: theme.bgSubtle, borderBottom: `1px solid ${theme.borderLight}` }}>
                      <th style={{ padding: '0.75rem 1rem', color: theme.textDim, fontWeight: 700 }}>Menu</th>
                      <th style={{ padding: '0.75rem 1rem', color: theme.textDim, fontWeight: 700 }}>Stage</th>
                      <th style={{ padding: '0.75rem 1rem', color: theme.textDim, fontWeight: 700 }}>Output</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>[New]</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#38bdf8', fontWeight: 600 }}>Draft</td>
                      <td style={{ padding: '0.75rem 1rem' }}>Here user can create a new fresh Budget</td>
                    </tr>
                    <tr style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>[Confirm]</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#34d399', fontWeight: 600 }}>Confirm</td>
                      <td style={{ padding: '0.75rem 1rem' }}>User confirm the newly created Budget</td>
                    </tr>
                    <tr style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>[Revise]</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#60a5fa', fontWeight: 600 }}>Revised</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <strong style={{ color: '#f87171', display: 'block', marginBottom: '0.2rem' }}>Only Visible at Confirmed Stage</strong>
                        On clicking Revise - New Budget will appear and Old one will move to Revised state. Link will be visible on Main Budget and on click it will lead to new revised Budget and the revised will have link to original.
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>[Cancelled]</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#f87171', fontWeight: 600 }}>Cancelled</td>
                      <td style={{ padding: '0.75rem 1rem' }}>Here User can archive the existing budget</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Field Explanations Card */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: theme.accentGold, marginBottom: '0.6rem' }}>
                Field Explanation &amp; Formulas
              </h3>
              <div style={{ overflowX: 'auto', border: `1px solid ${theme.borderLight}`, borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: theme.bgSubtle, borderBottom: `1px solid ${theme.borderLight}` }}>
                      <th style={{ padding: '0.75rem 1rem', color: theme.textDim, fontWeight: 700, width: '160px' }}>Field</th>
                      <th style={{ padding: '0.75rem 1rem', color: theme.textDim, fontWeight: 700 }}>Rule &amp; Calculation Formula</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Budget Name</td>
                      <td style={{ padding: '0.75rem 1rem' }}>Alpha Numeric. In case of Revision keep the original Budget name as it is and add the word &ldquo;Revised&rdquo; in last (e.g. <em>Project A Revised</em>).</td>
                    </tr>
                    <tr style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Budget Period</td>
                      <td style={{ padding: '0.75rem 1rem' }}>Date range (Start Date to End Date).</td>
                    </tr>
                    <tr style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Responsible</td>
                      <td style={{ padding: '0.75rem 1rem' }}>Select from Contacts Created (open list of contacts created on click).</td>
                    </tr>
                    <tr style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Analytics</td>
                      <td style={{ padding: '0.75rem 1rem' }}>The Analytic Account name set in the Analytical Account master.</td>
                    </tr>
                    <tr style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Type</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <strong>Income / Expenses</strong>. Analytics on all Sales Invoice lines mapped to Income; Analytics on all Purchase Order / Vendor Bill lines mapped to Expenses.
                      </td>
                    </tr>
                    <tr style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Achieved Amount</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <strong>Only Visible for Confirmed Budget</strong>. Dynamically computed by searching matched Sales Invoices (Income) or Vendor Bills (Expense) for the period. Clicking on the Achieved Amount button opens drill-down list view!
                      </td>
                    </tr>
                    <tr style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Achieved %</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        Formula: <code>(Achieved Amount / Committed Amount) * 100</code>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Amount to Achieve</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        Formula: <code>Committed Amount - Achieved Amount</code>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setIsGuideModalOpen(false)}
                style={{
                  padding: '0.55rem 1.3rem',
                  borderRadius: '6px',
                  backgroundColor: theme.accentGold,
                  color: '#0E0D0C',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Close Guide
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL 3: ENLARGED PIE CHART MODAL
      ═══════════════════════════════════════════════════════════════ */}
      {pieModalBudget && (
        <Modal
          isOpen={true}
          onClose={() => setPieModalBudget(null)}
          title={`Budget Breakdown: ${pieModalBudget.name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '0.5rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BudgetPieChart
                achieved={pieModalBudget.achievedAmount || 10000}
                committed={pieModalBudget.committedAmount || 200000}
                balance={pieModalBudget.amountToAchieve || 190000}
                size={180}
                showLegend={true}
                showTooltip={true}
              />
            </div>

            <div
              style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: '#06b6d415',
                  border: '1px solid #06b6d440',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '0.78rem', color: '#06b6d4', fontWeight: 600, display: 'block' }}>
                  Achieved Amount
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#06b6d4' }}>
                  ₹{(Number(pieModalBudget.achievedAmount) || 10000).toLocaleString()}
                </span>
              </div>

              <div
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: '#f43f5e15',
                  border: '1px solid #f43f5e40',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '0.78rem', color: '#f43f5e', fontWeight: 600, display: 'block' }}>
                  Balance To Achieve
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f43f5e' }}>
                  ₹{(Number(pieModalBudget.amountToAchieve) || 190000).toLocaleString()}
                </span>
              </div>
            </div>

            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  const b = pieModalBudget;
                  setPieModalBudget(null);
                  handleOpenBudgetForm(b);
                }}
                style={{
                  padding: '0.55rem 1.2rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: theme.accentGold,
                  color: '#0E0D0C',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Open Budget Form View
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
