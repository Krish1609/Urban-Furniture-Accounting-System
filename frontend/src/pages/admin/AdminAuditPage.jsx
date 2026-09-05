import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

export default function AdminAuditPage() {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');

  const auditEvents = [
    {
      id: 'AUD-1082',
      timestamp: 'Today, 01:14:45 AM',
      actor: 'Administrator (admin)',
      role: 'Administrator',
      action: 'Super Admin Access & User Console Inspection',
      resource: 'Auth / Team Directory',
      status: 'Success',
      severity: 'Low',
    },
    {
      id: 'AUD-1081',
      timestamp: 'Today, 01:09:16 AM',
      actor: 'System Auto-Seed',
      role: 'System',
      action: 'Batch User Master Verification (1 Admin, 5 Accountants, 5 Users)',
      resource: 'MySQL app_users',
      status: 'Success',
      severity: 'Info',
    },
    {
      id: 'AUD-1080',
      timestamp: 'Yesterday, 11:42:10 PM',
      actor: 'Rajeev Mehta (accountant)',
      role: 'Accountant',
      action: 'Posted Commercial Customer Invoice #INV-2026-001 (₹95,000)',
      resource: 'Sales Journal (J-SALES)',
      status: 'Success',
      severity: 'Medium',
    },
    {
      id: 'AUD-1079',
      timestamp: 'Yesterday, 10:30:25 PM',
      actor: 'Vikram Patel (vikram_acc)',
      role: 'Accountant',
      action: 'Reconciled HDFC Bank Account Ledger (₹1,45,000)',
      resource: 'Bank Operations (J-BANK)',
      status: 'Success',
      severity: 'Medium',
    },
    {
      id: 'AUD-1078',
      timestamp: 'Yesterday, 09:15:00 PM',
      actor: 'Nimesh Pathak (nimesh_user)',
      role: 'User',
      action: 'Customer Signed In via Client Portal',
      resource: 'User Portal Session',
      status: 'Success',
      severity: 'Low',
    },
    {
      id: 'AUD-1077',
      timestamp: '05 Sep 2026, 06:12:33 PM',
      actor: 'Administrator (admin)',
      role: 'Administrator',
      action: 'Approved Departmental Budget Revision (January 2026 Revised)',
      resource: 'Analytical Budgets',
      status: 'Success',
      severity: 'High',
    },
    {
      id: 'AUD-1076',
      timestamp: '05 Sep 2026, 03:40:12 PM',
      actor: 'System Guard',
      role: 'Security Engine',
      action: 'Blocked duplicate Administrator registration attempt',
      resource: 'Auth Policy Enforcement',
      status: 'Blocked',
      severity: 'High',
    }
  ];

  const filteredLogs = auditEvents.filter((item) => {
    const matchesSearch =
      item.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterSeverity === 'all') return true;
    return item.severity.toLowerCase() === filterSeverity.toLowerCase();
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.borderLight}`,
          borderRadius: '12px',
          padding: '1.8rem 2rem',
          boxShadow: theme.shadow,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldAlert size={24} style={{ color: '#f59e0b' }} />
              <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.45rem', fontWeight: 600, color: theme.textMain, margin: 0 }}>
                Security &amp; Audit Trail
              </h1>
            </div>
            <p style={{ fontSize: '0.82rem', color: theme.textMuted, marginTop: '0.25rem', marginBottom: 0 }}>
              Immutable audit logging for all authentication attempts, role modifications, and ledger transactions.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: theme.bgSubtle,
                color: theme.textMain,
                border: `1px solid ${theme.borderLight}`,
                padding: '0.55rem 1rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Download size={14} />
              <span>Export Audit Log</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.borderLight}`,
          borderRadius: '10px',
          padding: '0.9rem 1.4rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['all', 'High', 'Medium', 'Low', 'Info'].map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setFilterSeverity(sev)}
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: filterSeverity === sev ? `1px solid ${theme.accentGold}` : `1px solid ${theme.borderLight}`,
                backgroundColor: filterSeverity === sev ? theme.accentGoldSoft : theme.bgSubtle,
                color: filterSeverity === sev ? theme.accentGold : theme.textMain,
                cursor: 'pointer',
              }}
            >
              {sev === 'all' ? 'All Severities' : `${sev} Severity`}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: theme.textDim }} />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 1rem 0.5rem 2.4rem',
              fontSize: '0.84rem',
              backgroundColor: theme.bgSubtle,
              color: theme.textMain,
              border: `1px solid ${theme.borderLight}`,
              borderRadius: '6px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Logs Table */}
      <div
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.borderLight}`,
          borderRadius: '12px',
          padding: '1.2rem',
          boxShadow: theme.shadow,
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ backgroundColor: theme.bgSubtle, borderBottom: `2px solid ${theme.borderLight}` }}>
                <th style={{ padding: '0.8rem 1.1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Log ID &amp; Time</th>
                <th style={{ padding: '0.8rem 1.1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Actor &amp; Role</th>
                <th style={{ padding: '0.8rem 1.1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Event Action</th>
                <th style={{ padding: '0.8rem 1.1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Target Resource</th>
                <th style={{ padding: '0.8rem 1.1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: `1px solid ${theme.borderLight}`, color: theme.textMain }}>
                  <td style={{ padding: '0.9rem 1.1rem' }}>
                    <span style={{ fontWeight: 700, fontFamily: 'monospace', color: theme.accentGold, display: 'block' }}>
                      {log.id}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: theme.textMuted }}>{log.timestamp}</span>
                  </td>
                  <td style={{ padding: '0.9rem 1.1rem' }}>
                    <span style={{ fontWeight: 600, color: theme.textMain, display: 'block' }}>{log.actor}</span>
                    <span style={{ fontSize: '0.72rem', color: theme.textDim }}>Role: {log.role}</span>
                  </td>
                  <td style={{ padding: '0.9rem 1.1rem', fontWeight: 500 }}>
                    {log.action}
                  </td>
                  <td style={{ padding: '0.9rem 1.1rem', color: theme.textMuted, fontSize: '0.8rem' }}>
                    {log.resource}
                  </td>
                  <td style={{ padding: '0.9rem 1.1rem' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        backgroundColor: log.status === 'Success' ? '#10b98120' : '#ef444420',
                        color: log.status === 'Success' ? '#34d399' : '#f87171',
                        border: `1px solid ${theme.borderLight}`,
                      }}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
