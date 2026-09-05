import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAccounting } from '../context/AccountingContext';
import Modal from '../components/Modal';

export default function ContactsPage() {
  const { theme } = useTheme();
  const { contacts, addContact } = useAccounting();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Customer',
    email: '',
    mobile: '',
    city: '',
    state: 'Gujarat',
    pincode: '380001',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    addContact(formData);
    setFormData({ name: '', type: 'Customer', email: '', mobile: '', city: '', state: 'Gujarat', pincode: '380001' });
    setIsModalOpen(false);
  };

  return (
    <div>
      <div
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.borderLight}`,
          borderRadius: '12px',
          padding: '1.8rem',
          boxShadow: theme.shadow,
          color: theme.textMain,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.6rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.45rem', fontWeight: 600, color: theme.textMain }}>
              Contacts Master (Customers &amp; Vendors)
            </h1>
            <p style={{ fontSize: '0.82rem', color: theme.textMuted, marginTop: '0.2rem' }}>
              Manage customer ledgers, vendor details, and contact profiles.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: '0.55rem 1.1rem',
              backgroundColor: theme.accentGold,
              color: '#0E0D0C',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(226, 194, 155, 0.25)',
            }}
          >
            + Add Contact
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ backgroundColor: theme.bgSubtle }}>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mobile</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>City &amp; State</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Total Billed</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Due Balance</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((cnt) => (
                <tr
                  key={cnt.id}
                  style={{
                    borderBottom: `1px solid ${theme.borderLight}`,
                    color: theme.textMain,
                  }}
                >
                  <td style={{ padding: '0.95rem 1rem', fontWeight: 600, color: theme.textMain }}>
                    {cnt.name}
                  </td>
                  <td style={{ padding: '0.95rem 1rem' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.6rem',
                        backgroundColor: theme.bgSubtle,
                        border: `1px solid ${theme.borderLight}`,
                        borderRadius: '4px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        color: theme.accentGold,
                      }}
                    >
                      {cnt.type}
                    </span>
                  </td>
                  <td style={{ padding: '0.95rem 1rem', color: theme.textMuted }}>
                    {cnt.email}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', color: theme.textMuted }}>
                    {cnt.mobile}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', color: theme.textMuted }}>
                    {cnt.city}, {cnt.state}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', textAlign: 'right', fontWeight: 600, color: theme.textMain }}>
                    ₹{cnt.totalBilled.toLocaleString()}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', textAlign: 'right', color: cnt.dueAmount > 0 ? theme.error : theme.success, fontWeight: 700 }}>
                    ₹{cnt.dueAmount.toLocaleString()}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        backgroundColor: theme.successBg,
                        color: theme.success,
                        border: `1px solid ${theme.success}`,
                      }}
                    >
                      {cnt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Contact Modal */}
      <Modal title="Add New Contact" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.35rem' }}>
              Contact Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Azure Furniture Supplies"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: `1px solid ${theme.borderLight}`, backgroundColor: theme.bgInput, color: theme.textMain, outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.35rem' }}>
              Relationship Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: `1px solid ${theme.borderLight}`, backgroundColor: theme.bgInput, color: theme.textMain, outline: 'none' }}
            >
              <option value="Customer">Customer</option>
              <option value="Vendor">Vendor</option>
              <option value="Both">Both (Customer &amp; Vendor)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.35rem' }}>
              Email Address *
            </label>
            <input
              type="email"
              placeholder="e.g. contact@business.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: `1px solid ${theme.borderLight}`, backgroundColor: theme.bgInput, color: theme.textMain, outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.35rem' }}>
              Mobile Phone *
            </label>
            <input
              type="text"
              placeholder="e.g. +91 98250 11223"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              required
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: `1px solid ${theme.borderLight}`, backgroundColor: theme.bgInput, color: theme.textMain, outline: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.35rem' }}>
                City *
              </label>
              <input
                type="text"
                placeholder="Ahmedabad"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: `1px solid ${theme.borderLight}`, backgroundColor: theme.bgInput, color: theme.textMain, outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.35rem' }}>
                State *
              </label>
              <input
                type="text"
                placeholder="Gujarat"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: `1px solid ${theme.borderLight}`, backgroundColor: theme.bgInput, color: theme.textMain, outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.6rem' }}>
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
              Save Contact
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
