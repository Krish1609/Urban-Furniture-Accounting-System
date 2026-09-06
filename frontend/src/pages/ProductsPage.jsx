import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAccounting } from '../context/AccountingContext';
import {
  Package,
  Plus,
  ArrowLeft,
  List,
  LayoutGrid,
  Search,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Tag,
  DollarSign
} from 'lucide-react';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';

export default function ProductsPage() {
  const { theme } = useTheme();
  const { products, addProduct, updateProduct } = useAccounting();
  const navigate = useNavigate();

  // View mode: 'list' | 'kanban' | 'form'
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [notification, setNotification] = useState(null);

  // Categories list
  const existingCategories = Array.from(new Set((products || []).map((p) => p.category).filter(Boolean)));
  const [categories, setCategories] = useState(() => {
    const defaults = ['Electronics', 'Furniture', 'Ergonomic Seating', 'Tables & Workstations', 'Storage & Cabinets'];
    return Array.from(new Set([...defaults, ...existingCategories]));
  });
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Form State matching the user's Product Master Form View drawing
  const [formData, setFormData] = useState({
    name: '',
    type: 'Goods', // 'Goods' | 'Service' | 'Combo'
    category: 'Electronics',
    salesPrice: '',
    costPrice: '',
    imageUrl: '',
    sku: '',
  });

  const showToast = (text) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 3000);
  };

  // Reset form for new product
  const handleNewClick = () => {
    setEditingProductId(null);
    setFormData({
      name: '',
      type: 'Goods',
      category: categories[0] || 'Electronics',
      salesPrice: '',
      costPrice: '',
      imageUrl: '',
      sku: '',
    });
    setViewMode('form');
  };

  // Open existing product in Form View for editing
  const handleEditProduct = (prod) => {
    setEditingProductId(prod.id);
    setFormData({
      name: prod.name || '',
      type: prod.type || 'Goods',
      category: prod.category || 'General',
      salesPrice: prod.salesPrice !== undefined ? String(prod.salesPrice) : '',
      costPrice: prod.costPrice !== undefined ? String(prod.costPrice) : '',
      imageUrl: prod.imageUrl || prod.image || '',
      sku: prod.sku || '',
    });
    setViewMode('form');
  };

  // Confirm / Save Product (Form View)
  const handleConfirmSave = (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      alert('Product Name is required');
      return;
    }

    const payload = {
      name: formData.name,
      type: formData.type,
      category: formData.category,
      salesPrice: Number(formData.salesPrice) || 0,
      costPrice: Number(formData.costPrice) || 0,
      imageUrl: formData.imageUrl,
      image: formData.imageUrl,
      sku: formData.sku || undefined,
    };

    if (editingProductId) {
      updateProduct(editingProductId, payload);
      showToast(`Product "${formData.name}" updated successfully in MySQL!`);
    } else {
      addProduct(payload);
      showToast(`Product "${formData.name}" created successfully in MySQL!`);
    }

    setViewMode('list');
    setEditingProductId(null);
  };

  // Create new category on the fly
  const handleCreateCategoryOnTheFly = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const trimmed = newCategoryName.trim();
    if (!categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed]);
    }
    setFormData((prev) => ({ ...prev, category: trimmed }));
    setNewCategoryName('');
    setIsNewCategoryModalOpen(false);
    showToast(`Category "${trimmed}" created on the fly!`);
  };

  // Back button handler
  const handleBackClick = () => {
    if (viewMode === 'form') {
      setViewMode('list');
    } else {
      navigate('/dashboard');
    }
  };

  // Filtering
  const filteredProducts = (products || []).filter((p) => {
    if (!p) return false;
    const q = searchQuery.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.type && p.type.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q))
    );
  });

  const handleToggleSelect = (id) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleImageUploadSim = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({ ...prev, imageUrl: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

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

      {/* ─────────────────────────────────────────────────────────────
          1. FORM VIEW (Product Master Form View)
          ───────────────────────────────────────────────────────────── */}
      {viewMode === 'form' && (
        <div
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.borderLight}`,
            borderRadius: '12px',
            padding: '2rem 2.2rem',
            boxShadow: theme.shadow,
          }}
        >
          {/* Header Action Bar: [New] [Confirm] ... [Back] */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '1.2rem',
              borderBottom: `1px solid ${theme.borderLight}`,
              marginBottom: '1.8rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleNewClick}
                style={{
                  padding: '0.55rem 1.3rem',
                  backgroundColor: theme.bgSubtle,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: theme.textMain,
                  cursor: 'pointer',
                }}
              >
                New
              </button>

              <button
                type="button"
                onClick={handleConfirmSave}
                style={{
                  padding: '0.55rem 1.4rem',
                  backgroundColor: theme.accentGold,
                  color: '#0E0D0C',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(226, 194, 155, 0.3)',
                }}
              >
                Confirm
              </button>
            </div>

            <button
              type="button"
              onClick={handleBackClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1.2rem',
                backgroundColor: 'transparent',
                border: `1px solid ${theme.borderLight}`,
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: theme.textMuted,
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={15} />
              <span>Back</span>
            </button>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.4rem', fontWeight: 600, color: theme.textMain }}>
              {editingProductId ? 'Edit Product' : 'Product Master Form View'}
            </h2>
            <span style={{ fontSize: '0.8rem', color: theme.textMuted }}>
              Configure product details, type (Goods, Service, Combo), and category
            </span>
          </div>

          {/* Form Content matching Drawing Layout */}
          <form onSubmit={handleConfirmSave} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }}>
            {/* Left Column: Product Name, Type, Category, Sales Price, Cost */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
              {/* Product Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ width: '130px', fontSize: '0.88rem', fontWeight: 600, color: theme.textMain }}>
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Air Conditioner or Refrigerator"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    flex: 1,
                    padding: '0.7rem 0.9rem',
                    borderRadius: '6px',
                    border: `1px solid ${theme.borderLight}`,
                    backgroundColor: theme.bgInput,
                    color: theme.textMain,
                    outline: 'none',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              {/* Product Type (Goods | Service | Combo) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ width: '130px', fontSize: '0.88rem', fontWeight: 600, color: theme.textMain }}>
                  Product Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{
                    flex: 1,
                    padding: '0.7rem 0.9rem',
                    borderRadius: '6px',
                    border: `1px solid ${theme.borderLight}`,
                    backgroundColor: theme.bgInput,
                    color: theme.textMain,
                    outline: 'none',
                    fontSize: '0.88rem',
                  }}
                >
                  <option value="Goods">Goods</option>
                  <option value="Service">Service</option>
                  <option value="Combo">Combo</option>
                </select>
              </div>

              {/* Category (Selection + Create on the fly) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ width: '130px', fontSize: '0.88rem', fontWeight: 600, color: theme.textMain }}>
                  Category
                </label>
                <div style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '0.7rem 0.9rem',
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderLight}`,
                      backgroundColor: theme.bgInput,
                      color: theme.textMain,
                      outline: 'none',
                      fontSize: '0.88rem',
                    }}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => setIsNewCategoryModalOpen(true)}
                    title="Create Category on the fly (Many2one Field)"
                    style={{
                      padding: '0.65rem 0.9rem',
                      backgroundColor: theme.bgSubtle,
                      border: `1px solid ${theme.borderLight}`,
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: theme.accentGold,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    + Create
                  </button>
                </div>
              </div>

              {/* Sales Price */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ width: '130px', fontSize: '0.88rem', fontWeight: 600, color: theme.textMain }}>
                  Sales Price
                </label>
                <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '0.85rem', color: theme.textDim, fontSize: '0.85rem' }}>Rs.</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="100.00"
                    value={formData.salesPrice}
                    onChange={(e) => setFormData({ ...formData, salesPrice: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem 0.7rem 2.5rem',
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderLight}`,
                      backgroundColor: theme.bgInput,
                      color: theme.textMain,
                      outline: 'none',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>
              </div>

              {/* Cost */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ width: '130px', fontSize: '0.88rem', fontWeight: 600, color: theme.textMain }}>
                  Cost
                </label>
                <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '0.85rem', color: theme.textDim, fontSize: '0.85rem' }}>Rs.</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="50.00"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem 0.7rem 2.5rem',
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderLight}`,
                      backgroundColor: theme.bgInput,
                      color: theme.textMain,
                      outline: 'none',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Upload Image Box & Presets */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '100%',
                  maxWidth: '280px',
                  height: '200px',
                  border: `2px dashed ${theme.borderLight}`,
                  borderRadius: '12px',
                  backgroundColor: theme.bgSubtle,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
              >
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="Product Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <>
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        backgroundColor: theme.bgCard,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.accentGold,
                        border: `1px solid ${theme.borderLight}`,
                      }}
                    >
                      <Camera size={22} />
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: theme.textMain }}>
                      Upload Product Photo
                    </span>
                    <span style={{ fontSize: '0.7rem', color: theme.textDim }}>PNG, JPG or WebP</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUploadSim}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                  }}
                />
              </div>

              {formData.imageUrl && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: '' })}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: theme.error,
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  ✕ Remove Image
                </button>
              )}

              {/* Or Paste Image URL */}
              <div style={{ width: '100%', maxWidth: '280px' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: theme.textDim, marginBottom: '0.3rem' }}>
                  Or Paste Image URL:
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '6px',
                    border: `1px solid ${theme.borderLight}`,
                    backgroundColor: theme.bgInput,
                    color: theme.textMain,
                    fontSize: '0.78rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Quick Sample Furniture Presets */}
              <div style={{ width: '100%', maxWidth: '280px' }}>
                <span style={{ display: 'block', fontSize: '0.72rem', color: theme.textDim, marginBottom: '0.4rem', fontWeight: 600 }}>
                  Quick Presets:
                </span>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {[
                    { label: '🪑 Chair', url: 'https://images.unsplash.com/photo-1580481077197-28562391696b?w=500&auto=format&fit=crop&q=60' },
                    { label: '🪵 Table', url: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=500&auto=format&fit=crop&q=60' },
                    { label: '🛋️ Sofa', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=60' },
                    { label: '🖥️ Desk', url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500&auto=format&fit=crop&q=60' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        border: `1px solid ${theme.borderLight}`,
                        backgroundColor: theme.bgSubtle,
                        color: theme.textMain,
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. LIST & KANBAN VIEWS (Product Master List / Product Master Kanban)
          ───────────────────────────────────────────────────────────── */}
      {viewMode !== 'form' && (
        <div
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.borderLight}`,
            borderRadius: '12px',
            padding: '1.8rem',
            boxShadow: theme.shadow,
          }}
        >
          {/* Top Controls: [New] [Search Bar] [Back] [List/Kanban Switcher] */}
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
            {/* Left: New Button */}
            <button
              type="button"
              onClick={handleNewClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1.4rem',
                backgroundColor: theme.accentGold,
                color: '#0E0D0C',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(226, 194, 155, 0.25)',
              }}
            >
              <Plus size={15} />
              <span>New</span>
            </button>

            {/* Middle: Search Input */}
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder="Search products by name, category, type..."
              width="460px"
            />

            {/* Right: Back Button & View Switcher (List / Kanban) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '0.55rem 1.1rem',
                  backgroundColor: 'transparent',
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: theme.textMuted,
                  cursor: 'pointer',
                }}
              >
                Back
              </button>

              {/* View Toggle Icons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: theme.bgSubtle,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '6px',
                  padding: '0.2rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  title="Switch to List View"
                  style={{
                    padding: '0.4rem 0.6rem',
                    backgroundColor: viewMode === 'list' ? theme.bgCard : 'transparent',
                    color: viewMode === 'list' ? theme.accentGold : theme.textMuted,
                    border: viewMode === 'list' ? `1px solid ${theme.borderLight}` : 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <List size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('kanban')}
                  title="Switch to Kanban View"
                  style={{
                    padding: '0.4rem 0.6rem',
                    backgroundColor: viewMode === 'kanban' ? theme.bgCard : 'transparent',
                    color: viewMode === 'kanban' ? theme.accentGold : theme.textMuted,
                    border: viewMode === 'kanban' ? `1px solid ${theme.borderLight}` : 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* ─────────────────── LIST VIEW ─────────────────── */}
          {viewMode === 'list' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ backgroundColor: theme.bgSubtle }}>
                    <th style={{ padding: '0.85rem 1rem', width: '40px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                        onChange={handleSelectAll}
                        style={{ accentColor: theme.accentGold, cursor: 'pointer' }}
                      />
                    </th>
                    <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</th>
                    <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                    <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                    <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Sales Price</th>
                    <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Cost</th>
                    <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((prod) => {
                    const isSelected = selectedProductIds.includes(prod.id);

                    return (
                      <tr
                        key={prod.id}
                        style={{
                          borderBottom: `1px solid ${theme.borderLight}`,
                          backgroundColor: isSelected ? theme.bgSubtle : 'transparent',
                          transition: 'background-color 100ms ease',
                        }}
                      >
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(prod.id)}
                            style={{ accentColor: theme.accentGold, cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '6px',
                                backgroundColor: theme.bgSubtle,
                                border: `1px solid ${theme.borderLight}`,
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {prod.imageUrl || prod.image ? (
                                <img src={prod.imageUrl || prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <Package size={18} style={{ color: theme.accentGold }} />
                              )}
                            </div>
                            <span
                              onClick={() => handleEditProduct(prod)}
                              style={{ fontWeight: 600, color: theme.textMain, cursor: 'pointer' }}
                            >
                              {prod.name}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: theme.textMuted }}>
                          {prod.category}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              backgroundColor: theme.bgSubtle,
                              color: prod.type === 'Service' ? '#60A5FA' : prod.type === 'Combo' ? '#F472B6' : theme.accentGold,
                              border: `1px solid ${theme.borderLight}`,
                            }}
                          >
                            {prod.type}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700, color: theme.textMain }}>
                          {Number(prod.salesPrice).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: theme.textMuted, fontWeight: 500 }}>
                          {Number(prod.costPrice).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleEditProduct(prod)}
                            style={{
                              padding: '0.35rem 0.75rem',
                              backgroundColor: theme.bgSubtle,
                              border: `1px solid ${theme.borderLight}`,
                              borderRadius: '4px',
                              color: theme.accentGold,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ─────────────────── KANBAN VIEW ─────────────────── */}
          {viewMode === 'kanban' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.2rem',
              }}
            >
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleEditProduct(prod)}
                  style={{
                    backgroundColor: theme.bgSubtle,
                    border: `1.5px solid ${theme.borderLight}`,
                    borderRadius: '12px',
                    padding: '1.2rem 1.4rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.2rem',
                    cursor: 'pointer',
                    transition: 'all 140ms ease',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = theme.accentGold;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = theme.borderLight;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Left: Product Image */}
                  <div
                    style={{
                      width: '74px',
                      height: '74px',
                      borderRadius: '10px',
                      backgroundColor: theme.bgCard,
                      border: `1px solid ${theme.borderLight}`,
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {prod.imageUrl || prod.image ? (
                      <img src={prod.imageUrl || prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Package size={30} style={{ color: theme.accentGold }} />
                    )}
                  </div>

                  {/* Right: Product Details matching Drawing */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', overflow: 'hidden' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: theme.textMain, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {prod.name}
                    </div>
                    <div style={{ fontSize: '0.84rem', color: theme.textMuted }}>
                      Sales Price: <strong style={{ color: theme.textMain }}>{Number(prod.salesPrice).toLocaleString()}</strong>
                    </div>
                    <div style={{ fontSize: '0.84rem', color: theme.textMuted }}>
                      Cost: <strong style={{ color: theme.textDim }}>{Number(prod.costPrice).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE CATEGORY MODAL (On the fly) */}
      <Modal
        isOpen={isNewCategoryModalOpen}
        onClose={() => setIsNewCategoryModalOpen(false)}
        title="Create Product Category On The Fly"
      >
        <form onSubmit={handleCreateCategoryOnTheFly} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.35rem' }}>
              Category Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Electronics, Luxury Sofas, Office Furniture"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                border: `1px solid ${theme.borderLight}`,
                backgroundColor: theme.bgInput,
                color: theme.textMain,
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.6rem' }}>
            <button
              type="button"
              onClick={() => setIsNewCategoryModalOpen(false)}
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
              Save &amp; Select Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
