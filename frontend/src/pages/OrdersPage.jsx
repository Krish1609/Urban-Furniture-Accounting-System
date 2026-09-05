import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAccounting } from '../context/AccountingContext';

export default function OrdersPage() {
  const { theme } = useTheme();
  const {
    orders,
    invoices,
    convertPOToBill,
    convertSOToInvoice,
    payInvoice,
  } = useAccounting();

  return (
    <div style={{ color: theme.textMain }}>
      {/* 1. Purchase Orders */}
      <div
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.borderLight}`,
          borderRadius: '12px',
          padding: '1.8rem',
          boxShadow: theme.shadow,
          marginBottom: '2rem',
        }}
      >
        <div style={{ marginBottom: '1.4rem' }}>
          <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.35rem', fontWeight: 600, color: theme.textMain }}>
            Purchase Orders (Procurement Flow)
          </h2>
          <p style={{ fontSize: '0.82rem', color: theme.textMuted, marginTop: '0.2rem' }}>
            Vendor orders (e.g. Azure Furniture) → Convert to Vendor Bill → Auto Double-Entry.
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ backgroundColor: theme.bgSubtle }}>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>PO #</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vendor</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Total</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.filter((o) => o.type === 'Purchase').map((po) => (
                <tr
                  key={po.id}
                  style={{
                    borderBottom: `1px solid ${theme.borderLight}`,
                    color: theme.textMain,
                  }}
                >
                  <td style={{ padding: '0.95rem 1rem', fontWeight: 600, color: theme.accentGold }}>
                    {po.id}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', color: theme.textMain, fontWeight: 500 }}>
                    {po.contactName}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', color: theme.textMuted }}>
                    {po.date}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', color: theme.textMuted }}>
                    {po.items.map((i) => `${i.qty}x ${i.productName}`).join(', ')}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', textAlign: 'right', fontWeight: 700, color: theme.textMain }}>
                    ₹{po.totalAmount.toLocaleString()}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        backgroundColor: po.status === 'Billed' ? theme.successBg : theme.errorBg,
                        color: po.status === 'Billed' ? theme.success : theme.error,
                        border: `1px solid ${po.status === 'Billed' ? theme.success : theme.error}`,
                      }}
                    >
                      {po.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.95rem 1rem', textAlign: 'center' }}>
                    {po.status !== 'Billed' ? (
                      <button
                        type="button"
                        onClick={() => convertPOToBill(po)}
                        style={{
                          padding: '0.45rem 0.85rem',
                          backgroundColor: theme.accentGold,
                          color: '#0E0D0C',
                          border: 'none',
                          borderRadius: '5px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Convert to Bill
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: theme.textDim, fontWeight: 600 }}>✓ Billed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Sales Orders */}
      <div
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.borderLight}`,
          borderRadius: '12px',
          padding: '1.8rem',
          boxShadow: theme.shadow,
          marginBottom: '2rem',
        }}
      >
        <div style={{ marginBottom: '1.4rem' }}>
          <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.35rem', fontWeight: 600, color: theme.textMain }}>
            Sales Orders (Revenue Flow)
          </h2>
          <p style={{ fontSize: '0.82rem', color: theme.textMuted, marginTop: '0.2rem' }}>
            Customer orders (e.g. Nimesh Pathak 5 Office Chairs) → Generate Invoice → Receive Payment.
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ backgroundColor: theme.bgSubtle }}>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>SO #</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Total</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.filter((o) => o.type === 'Sales' || o.type === 'Sale').map((so) => (
                <tr
                  key={so.id}
                  style={{
                    borderBottom: `1px solid ${theme.borderLight}`,
                    color: theme.textMain,
                  }}
                >
                  <td style={{ padding: '0.95rem 1rem', fontWeight: 600, color: theme.accentGold }}>
                    {so.id}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', color: theme.textMain, fontWeight: 500 }}>
                    {so.contactName}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', color: theme.textMuted }}>
                    {so.date}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', color: theme.textMuted }}>
                    {so.items.map((i) => `${i.qty}x ${i.productName}`).join(', ')}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', textAlign: 'right', fontWeight: 700, color: theme.textMain }}>
                    ₹{so.totalAmount.toLocaleString()}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        backgroundColor: so.status === 'Invoiced' ? theme.successBg : theme.errorBg,
                        color: so.status === 'Invoiced' ? theme.success : theme.error,
                        border: `1px solid ${so.status === 'Invoiced' ? theme.success : theme.error}`,
                      }}
                    >
                      {so.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.95rem 1rem', textAlign: 'center' }}>
                    {so.status !== 'Invoiced' ? (
                      <button
                        type="button"
                        onClick={() => convertSOToInvoice(so)}
                        style={{
                          padding: '0.45rem 0.85rem',
                          backgroundColor: theme.accentGold,
                          color: '#0E0D0C',
                          border: 'none',
                          borderRadius: '5px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Convert to Invoice
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: theme.textDim, fontWeight: 600 }}>✓ Invoiced</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Invoices & Bills Table */}
      <div
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.borderLight}`,
          borderRadius: '12px',
          padding: '1.8rem',
          boxShadow: theme.shadow,
        }}
      >
        <div style={{ marginBottom: '1.4rem' }}>
          <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.35rem', fontWeight: 600, color: theme.textMain }}>
            Invoices &amp; Vendor Bills
          </h2>
          <p style={{ fontSize: '0.82rem', color: theme.textMuted, marginTop: '0.2rem' }}>
            Customer invoices, supplier bills, payment registration, and real-time ledger settlement.
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ backgroundColor: theme.bgSubtle }}>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Doc #</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Party / Contact</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  style={{
                    borderBottom: `1px solid ${theme.borderLight}`,
                    color: theme.textMain,
                  }}
                >
                  <td style={{ padding: '0.95rem 1rem', fontWeight: 600, color: theme.accentGold }}>
                    {inv.id}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', color: theme.textMain, fontWeight: 500 }}>
                    {inv.type}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', color: theme.textMain }}>
                    {inv.contactName}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', color: theme.textMuted }}>
                    {inv.date}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', textAlign: 'right', fontWeight: 700, color: theme.textMain }}>
                    ₹{inv.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', textAlign: 'center' }}>
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
                  <td style={{ padding: '0.95rem 1rem', textAlign: 'center' }}>
                    {inv.status !== 'Paid' ? (
                      <button
                        type="button"
                        onClick={() => payInvoice(inv.id, 'HDFC Bank')}
                        style={{
                          padding: '0.45rem 0.85rem',
                          backgroundColor: theme.success,
                          color: '#0E0D0C',
                          border: 'none',
                          borderRadius: '5px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Register Payment
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: theme.textDim, fontWeight: 600 }}>
                        Paid ({inv.paymentMethod || 'Bank'})
                      </span>
                    )}
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
