import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAccounting } from '../context/AccountingContext';
import { Receipt, CreditCard, CheckCircle2, AlertCircle, Eye, Printer, ShieldCheck } from 'lucide-react';
import Modal from '../components/Modal';

export default function UserPortalPage() {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const { invoices, payInvoice } = useAccounting();

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payModalInvoice, setPayModalInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('HDFC Bank');
  const [successToast, setSuccessToast] = useState(null);

  // Invoices list safe filtering
  const userInvoices = (invoices || []).filter(
    (inv) => inv && (
      (inv.contactName && inv.contactName.toLowerCase().includes('nimesh')) ||
      (inv.contactName && inv.contactName.toLowerCase().includes('azure')) ||
      true
    )
  );

  const totalDue = userInvoices
    .filter((inv) => inv && inv.status !== 'Paid')
    .reduce((s, inv) => s + ((Number(inv.amount) || 0) - (Number(inv.paidAmount) || 0)), 0);

  const totalPaid = userInvoices
    .filter((inv) => inv && inv.status === 'Paid')
    .reduce((s, inv) => s + (Number(inv.amount) || 0), 0);

  const handleExecutePayment = (e) => {
    e.preventDefault();
    if (!payModalInvoice) return;

    payInvoice(payModalInvoice.id, paymentMethod);
    setSuccessToast(`Payment of ₹${(Number(payModalInvoice.amount) || 0).toLocaleString()} for ${payModalInvoice.id} processed successfully!`);
    setPayModalInvoice(null);

    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: theme.accentGold, letterSpacing: '0.1em' }}>
                Client &amp; Vendor Self-Service Portal
              </span>
            </div>
            <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.45rem', fontWeight: 600, color: theme.textMain }}>
              Welcome, {currentUser?.name || 'User'}
            </h1>
            <p style={{ fontSize: '0.82rem', color: theme.textMuted, marginTop: '0.2rem' }}>
              Account Login: {currentUser?.loginId || 'user_demo'} • Connected to FurniLedger Secure Ledger
            </p>
          </div>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div
            style={{
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.75rem 1rem',
              backgroundColor: theme.successBg,
              color: theme.success,
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 600,
              border: `1px solid ${theme.success}`,
            }}
          >
            <CheckCircle2 size={16} />
            <span>{successToast}</span>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.2rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.borderLight}`,
            borderRadius: '10px',
            padding: '1.5rem',
            boxShadow: theme.shadow,
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.textDim, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Outstanding Balance Due
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: totalDue > 0 ? theme.error : theme.success, margin: '0.4rem 0' }}>
            ₹{totalDue.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.78rem', color: theme.textMuted }}>
            {totalDue > 0 ? 'Pending clearance' : 'All invoices cleared'}
          </span>
        </div>

        <div
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.borderLight}`,
            borderRadius: '10px',
            padding: '1.5rem',
            boxShadow: theme.shadow,
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.textDim, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Lifetime Settled
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: theme.textMain, margin: '0.4rem 0' }}>
            ₹{totalPaid.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.78rem', color: theme.textMuted }}>
            Successfully recorded in journal ledger
          </span>
        </div>
      </div>

      {/* Invoices List */}
      <div
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.borderLight}`,
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: theme.shadow,
        }}
      >
        <div style={{ padding: '1.2rem 1.4rem', borderBottom: `1px solid ${theme.borderLight}` }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: theme.textMain }}>
            My Invoices, Bills &amp; Payment Receipts
          </h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ backgroundColor: theme.bgSubtle }}>
                <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invoice #</th>
                <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Billing Date</th>
                <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Due Date</th>
                <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Total Amount</th>
                <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {userInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  style={{
                    borderBottom: `1px solid ${theme.borderLight}`,
                    color: theme.textMain,
                  }}
                >
                  <td style={{ padding: '0.95rem 1.2rem', fontWeight: 600, color: theme.accentGold }}>
                    {inv.id}
                  </td>
                  <td style={{ padding: '0.95rem 1.2rem', fontWeight: 500, color: theme.textMain }}>
                    {inv.type}
                  </td>
                  <td style={{ padding: '0.95rem 1.2rem', color: theme.textMuted }}>
                    {inv.date}
                  </td>
                  <td style={{ padding: '0.95rem 1.2rem', color: theme.textMuted }}>
                    {inv.dueDate}
                  </td>
                  <td style={{ padding: '0.95rem 1.2rem', textAlign: 'right', fontWeight: 700, color: theme.textMain }}>
                    ₹{(Number(inv.amount) || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.95rem 1.2rem', textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        backgroundColor: inv.status === 'Paid' ? theme.successBg : theme.errorBg,
                        color: inv.status === 'Paid' ? theme.success : theme.error,
                        border: `1px solid ${inv.status === 'Paid' ? theme.success : theme.error}`,
                      }}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.95rem 1.2rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedInvoice(inv)}
                        title="View Official Receipt"
                        style={{
                          padding: '0.4rem 0.75rem',
                          backgroundColor: theme.bgSubtle,
                          border: `1px solid ${theme.borderLight}`,
                          borderRadius: '5px',
                          color: theme.textMain,
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontWeight: 600,
                        }}
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>

                      {inv.status !== 'Paid' && (
                        <button
                          type="button"
                          onClick={() => setPayModalInvoice(inv)}
                          style={{
                            padding: '0.4rem 0.85rem',
                            backgroundColor: theme.accentGold,
                            border: 'none',
                            borderRadius: '5px',
                            color: '#0E0D0C',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <CreditCard size={13} />
                          <span>Pay Now</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Modal */}
      <Modal
        isOpen={!!payModalInvoice}
        onClose={() => setPayModalInvoice(null)}
        title={`Settle Invoice: ${payModalInvoice?.id}`}
      >
        <form onSubmit={handleExecutePayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: theme.textMuted, display: 'block', marginBottom: '0.3rem' }}>
              Payee / Party
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: theme.textMain }}>
              {payModalInvoice?.contactName}
            </div>
          </div>

          <div style={{ padding: '1.2rem', backgroundColor: theme.bgSubtle, borderRadius: '8px', border: `1px solid ${theme.borderLight}` }}>
            <span style={{ fontSize: '0.75rem', color: theme.textMuted, display: 'block' }}>Total Amount to Settle</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: theme.accentGold }}>
              ₹{(Number(payModalInvoice?.amount) || 0).toLocaleString()}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.35rem' }}>
              Payment Channel *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                border: `1px solid ${theme.borderLight}`,
                backgroundColor: theme.bgInput,
                color: theme.textMain,
                outline: 'none',
              }}
            >
              <option value="HDFC Bank">HDFC Bank (NEFT / RTGS / Online Banking)</option>
              <option value="ICICI Bank">ICICI Corporate Bank</option>
              <option value="Petty Cash">Cash Payment</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.8rem' }}>
            <button
              type="button"
              onClick={() => setPayModalInvoice(null)}
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
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Authorize &amp; Pay ₹{(Number(payModalInvoice?.amount) || 0).toLocaleString()}
            </button>
          </div>
        </form>
      </Modal>

      {/* Invoice Document Modal */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title={`Tax Invoice / Bill: ${selectedInvoice?.id}`}
      >
        {selectedInvoice && (
          <div>
            <div style={{ borderBottom: `1px solid ${theme.borderLight}`, paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: theme.textMain }}>FurniLedger Systems</h3>
                  <p style={{ fontSize: '0.75rem', color: theme.textMuted }}>Ahmedabad, Gujarat • GSTIN: 24AAACU8923M1Z8</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: theme.textMuted }}>Status</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: selectedInvoice.status === 'Paid' ? theme.success : theme.error }}>
                    {selectedInvoice.status}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem', fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: theme.textMuted, display: 'block' }}>Billed To:</span>
                <span style={{ fontWeight: 600, color: theme.textMain }}>{selectedInvoice.contactName}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: theme.textMuted, display: 'block' }}>Invoice Date / Due:</span>
                <span style={{ fontWeight: 600, color: theme.textMain }}>{selectedInvoice.date} (Due: {selectedInvoice.dueDate})</span>
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: theme.bgSubtle, borderRadius: '8px', border: `1px solid ${theme.borderLight}`, marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <span style={{ color: theme.textMuted }}>Subtotal:</span>
                <span style={{ fontWeight: 600, color: theme.textMain }}>₹{Math.round((Number(selectedInvoice.amount) || 0) / 1.18).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <span style={{ color: theme.textMuted }}>GST (18%):</span>
                <span style={{ fontWeight: 600, color: theme.textMain }}>₹{Math.round((Number(selectedInvoice.amount) || 0) - (Number(selectedInvoice.amount) || 0) / 1.18).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, borderTop: `1px solid ${theme.borderLight}`, paddingTop: '0.4rem', color: theme.accentGold }}>
                <span>Grand Total:</span>
                <span>₹{(Number(selectedInvoice.amount) || 0).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: `1px solid ${theme.borderLight}`,
                  backgroundColor: 'transparent',
                  color: theme.textMuted,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  padding: '0.5rem 1.1rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: theme.accentGold,
                  color: '#0E0D0C',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Print Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
