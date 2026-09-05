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
          borderRadius: '8px',
          padding: '1.8rem',
          boxShadow: theme.shadow,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.4rem' }}>
          <div>
            <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.4rem', fontWeight: 600, color: theme.textMain }}>
              Product Master (Furniture Catalog)
            </h1>
            <p style={{ fontSize: '0.8rem', color: theme.textMuted }}>
              Manage physical furniture goods, assembly services, sales prices, and costs.
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
            + Add Furniture Product
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>SKU</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Product Name</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Type</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Category</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Sales Price</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Cost Price</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Tax Rate</th>
              <th style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.textDim, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Stock Quantity</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr key={prod.id}>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, fontFamily: 'monospace', fontSize: '0.78rem' }}>{prod.sku}</td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, fontWeight: 600 }}>{prod.name}</td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}` }}>{prod.type}</td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}` }}>{prod.category}</td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, color: theme.success, fontWeight: 600 }}>₹{prod.salesPrice.toLocaleString()}</td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}` }}>₹{prod.costPrice.toLocaleString()}</td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}` }}>{prod.taxRate}%</td>
                <td style={{ padding: '0.9rem 1rem', borderBottom: `1px solid ${theme.borderLight}`, fontWeight: 600 }}>{prod.stockQty} units</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      <Modal title="Add Furniture Product" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <input
            type="text"
            placeholder="Product Name (e.g. Ergonomic Office Chair)"
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
            <option value="Goods">Goods (Physical Furniture)</option>
            <option value="Service">Service (Assembly / Polishing)</option>
            <option value="Combo">Combo Package</option>
          </select>

          <input
            type="text"
            placeholder="Category (e.g. Chairs, Tables, Sofas)"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            style={{ padding: '0.75rem', borderRadius: '4px', border: `1px solid ${theme.borderLight}`, backgroundColor: theme.bgInput, color: theme.textMain }}
          />

          <input
            type="number"
            placeholder="Sales Price (₹)"
            value={formData.salesPrice}
            onChange={(e) => setFormData({ ...formData, salesPrice: e.target.value })}
            required
            style={{ padding: '0.75rem', borderRadius: '4px', border: `1px solid ${theme.borderLight}`, backgroundColor: theme.bgInput, color: theme.textMain }}
          />

          <input
            type="number"
            placeholder="Purchase Cost Price (₹)"
            value={formData.costPrice}
            onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
            required
            style={{ padding: '0.75rem', borderRadius: '4px', border: `1px solid ${theme.borderLight}`, backgroundColor: theme.bgInput, color: theme.textMain }}
          />

          <input
            type="number"
            placeholder="Initial Stock Quantity"
            value={formData.stockQty}
            onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })}
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
              Save Product
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
