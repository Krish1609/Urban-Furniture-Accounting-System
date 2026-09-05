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
    <div>
      {/* 1. Purchase Orders */}
      <div
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.borderLight}`,
          borderRadius: '8px',
          padding: '1.8rem',
          boxShadow: theme.shadow,
          marginBottom: '2rem',
        }}
      >
        <div style={{ marginBottom: '1.4rem' }}>
          <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: theme.textMain }}>
            Purchase Orders (Procurement Flow)
          </h2>
          <p style={{ fontSize: '0.8rem', color: theme.textMuted }}>
            Vendor orders (e.g. Azure Furniture) → Convert to Vendor Bill → Auto Double-Entry.
          </p>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>PO #</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Vendor</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Date</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Items</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Total</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.filter((o) => o.type === 'Purchase').map((po) => (
              <tr key={po.id}>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, fontWeight: 600 }}>{po.id}</td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}` }}>{po.contactName}</td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}` }}>{po.date}</td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}` }}>
                  {po.items.map((i) => `${i.qty}x ${i.productName}`).join(', ')}
                </td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, fontWeight: 600 }}>₹{po.totalAmount.toLocaleString()}</td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}` }}>
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
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}` }}>
                  {po.status !== 'Billed' ? (
                    <button
                      type="button"
                      onClick={() => convertPOToBill(po)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        backgroundColor: theme.accentGold,
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Convert to Bill
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: theme.textDim }}>Billed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. Sales Orders */}
      <div
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.borderLight}`,
          borderRadius: '8px',
          padding: '1.8rem',
          boxShadow: theme.shadow,
          marginBottom: '2rem',
        }}
      >
        <div style={{ marginBottom: '1.4rem' }}>
          <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: theme.textMain }}>
            Sales Orders (Revenue Flow)
          </h2>
          <p style={{ fontSize: '0.8rem', color: theme.textMuted }}>
            Customer orders (e.g. Nimesh Pathak 5 Office Chairs) → Generate Invoice → Receive Payment.
          </p>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>SO #</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Customer</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Date</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Items</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Total</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.filter((o) => o.type === 'Sale').map((so) => (
              <tr key={so.id}>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, fontWeight: 600 }}>{so.id}</td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}` }}>{so.contactName}</td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}` }}>{so.date}</td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}` }}>
                  {so.items.map((i) => `${i.qty}x ${i.productName}`).join(', ')}
                </td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, fontWeight: 600 }}>₹{so.totalAmount.toLocaleString()}</td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}` }}>
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
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}` }}>
                  {so.status !== 'Invoiced' ? (
                    <button
                      type="button"
                      onClick={() => convertSOToInvoice(so)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        backgroundColor: theme.accentGold,
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Generate Invoice
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: theme.textDim }}>Invoiced</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. Invoices & Bills Table */}
      <div
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.borderLight}`,
          borderRadius: '8px',
          padding: '1.8rem',
          boxShadow: theme.shadow,
        }}
      >
        <div style={{ marginBottom: '1.4rem' }}>
          <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: theme.textMain }}>
            Customer Invoices &amp; Vendor Bills
          </h2>
          <p style={{ fontSize: '0.8rem', color: theme.textMuted }}>
            Pay vendor bills or receive customer payments.
          </p>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Doc ID</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Type</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Partner</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Date</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Amount</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, fontWeight: 600 }}>{inv.id}</td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}` }}>{inv.type}</td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}` }}>{inv.contactName}</td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}` }}>{inv.date}</td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, fontWeight: 600 }}>₹{inv.amount.toLocaleString()}</td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}` }}>
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
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}` }}>
                  {inv.status !== 'Paid' ? (
                    <button
                      type="button"
                      onClick={() => payInvoice(inv.id, 'HDFC Bank Account')}
                      style={{
                        padding: '0.35rem 0.75rem',
                        backgroundColor: theme.accentGold,
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Pay Now
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: theme.textDim }}>Paid</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
