import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAccounting } from '../context/AccountingContext';
import Modal from '../components/Modal';

export default function ProductsPage() {
  const { theme } = useTheme();
  const { products, addProduct } = useAccounting();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Goods',
    category: 'Chairs',
    salesPrice: '',
    costPrice: '',
    taxRate: 18,
    stockQty: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    addProduct({
      name: formData.name,
      type: formData.type,
      category: formData.category,
      salesPrice: Number(formData.salesPrice) || 0,
      costPrice: Number(formData.costPrice) || 0,
      taxRate: Number(formData.taxRate) || 18,
      stockQty: Number(formData.stockQty) || 0,
    });
    setFormData({ name: '', type: 'Goods', category: 'Chairs', salesPrice: '', costPrice: '', taxRate: 18, stockQty: '' });
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
              Product Master (Furniture Catalog)
            </h1>
            <p style={{ fontSize: '0.82rem', color: theme.textMuted, marginTop: '0.2rem' }}>
              Manage physical furniture goods, assembly services, sales prices, and costs.
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
            + Add Furniture Product
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ backgroundColor: theme.bgSubtle }}>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>SKU</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product Name</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Sales Price</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Cost Price</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Tax Rate</th>
                <th style={{ padding: '0.85rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Stock Qty</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr
                  key={prod.id}
                  style={{
                    borderBottom: `1px solid ${theme.borderLight}`,
                    color: theme.textMain,
                  }}
                >
                  <td style={{ padding: '0.95rem 1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: theme.accentGold, fontWeight: 600 }}>
                    {prod.sku}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', fontWeight: 600, color: theme.textMain }}>
                    {prod.name}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', color: theme.textMuted }}>
                    {prod.type}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', color: theme.textMuted }}>
                    {prod.category}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', textAlign: 'right', color: theme.success, fontWeight: 700 }}>
                    ₹{prod.salesPrice.toLocaleString()}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', textAlign: 'right', color: theme.textMuted }}>
                    ₹{prod.costPrice.toLocaleString()}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', textAlign: 'center', color: theme.textMain }}>
                    {prod.taxRate}%
                  </td>
                  <td style={{ padding: '0.95rem 1rem', textAlign: 'right', fontWeight: 600, color: theme.textMain }}>
                    {prod.stockQty} units
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal title="Add Furniture Product" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.35rem' }}>
              Product Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Ergonomic Office Chair"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: `1px solid ${theme.borderLight}`, backgroundColor: theme.bgInput, color: theme.textMain, outline: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.35rem' }}>
                Product Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: `1px solid ${theme.borderLight}`, backgroundColor: theme.bgInput, color: theme.textMain, outline: 'none' }}
              >
                <option value="Goods">Goods (Physical Stock)</option>
                <option value="Service">Service (Assembly / Labor)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.35rem' }}>
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: `1px solid ${theme.borderLight}`, backgroundColor: theme.bgInput, color: theme.textMain, outline: 'none' }}
              >
                <option value="Chairs">Chairs</option>
                <option value="Tables">Tables</option>
                <option value="Desks">Desks</option>
                <option value="Storage">Storage &amp; Wardrobes</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.35rem' }}>
                Sales Price (₹) *
              </label>
              <input
                type="number"
                placeholder="e.g. 4500"
                value={formData.salesPrice}
                onChange={(e) => setFormData({ ...formData, salesPrice: e.target.value })}
                required
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: `1px solid ${theme.borderLight}`, backgroundColor: theme.bgInput, color: theme.textMain, outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.35rem' }}>
                Cost Price (₹) *
              </label>
              <input
                type="number"
                placeholder="e.g. 2800"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                required
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: `1px solid ${theme.borderLight}`, backgroundColor: theme.bgInput, color: theme.textMain, outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.35rem' }}>
                Tax Rate (%) *
              </label>
              <input
                type="number"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: `1px solid ${theme.borderLight}`, backgroundColor: theme.bgInput, color: theme.textMain, outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.35rem' }}>
                Initial Stock Qty *
              </label>
              <input
                type="number"
                placeholder="e.g. 25"
                value={formData.stockQty}
                onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })}
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
              Save Product
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
