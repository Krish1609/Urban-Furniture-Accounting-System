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
          borderRadius: '8px',
          padding: '1.8rem',
          boxShadow: theme.shadow,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.4rem' }}>
          <div>
            <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.4rem', fontWeight: 600, color: theme.textMain }}>
              Contacts Master (Customers &amp; Vendors)
            </h1>
            <p style={{ fontSize: '0.8rem', color: theme.textMuted }}>
              Manage customer ledgers, vendor details, and contact profiles.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: theme.accentGold,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '5px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Add Contact
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Name</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Type</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Email</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Mobile</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>City &amp; State</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Billed</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Due Balance</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((cnt) => (
              <tr key={cnt.id}>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, fontWeight: 600 }}>{cnt.name}</td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}` }}>
                  <span style={{ padding: '0.2rem 0.5rem', backgroundColor: theme.bgSubtle, borderRadius: '4px', fontSize: '0.74rem' }}>
                    {cnt.type}
                  </span>
                </td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}` }}>{cnt.email}</td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}` }}>{cnt.mobile}</td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}` }}>{cnt.city}, {cnt.state}</td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}` }}>₹{cnt.totalBilled.toLocaleString()}</td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: cnt.dueAmount > 0 ? theme.error : theme.success, fontWeight: 600 }}>
                  ₹{cnt.dueAmount.toLocaleString()}
                </td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}` }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      padding: '0.2rem 0.55rem',
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

      {/* Add Contact Modal */}
      <Modal title="Add New Contact" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <input
            type="text"
            placeholder="Contact Name (e.g. Azure Furniture Supplies)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            style={{ padding: '0.75rem', borderRadius: '4px', border: `1px solid ${theme.borderLight}`, backgroundColor: theme.bgInput, color: theme.textMain }}
          />

          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            style={{ padding: '0.75rem', borderRadius: '4px', border: `1px solid ${theme.borderLight}`, backgroundColor: theme.bgInput, color: theme.textMain }}
          >
            <option value="Customer">Customer</option>
            <option value="Vendor">Vendor</option>
            <option value="Both">Both (Customer &amp; Vendor)</option>
          </select>

          <input
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            style={{ padding: '0.75rem', borderRadius: '4px', border: `1px solid ${theme.borderLight}`, backgroundColor: theme.bgInput, color: theme.textMain }}
          />

          <input
            type="text"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            required
            style={{ padding: '0.75rem', borderRadius: '4px', border: `1px solid ${theme.borderLight}`, backgroundColor: theme.bgInput, color: theme.textMain }}
          />

          <input
            type="text"
            placeholder="City (e.g. Ahmedabad)"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
            style={{ padding: '0.75rem', borderRadius: '4px', border: `1px solid ${theme.borderLight}`, backgroundColor: theme.bgInput, color: theme.textMain }}
          />

          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: theme.accentGold,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '5px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Save Contact
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              style={{
                padding: '0.75rem 1.2rem',
                backgroundColor: 'transparent',
                color: theme.textMuted,
                border: `1px solid ${theme.borderLight}`,
                borderRadius: '5px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
