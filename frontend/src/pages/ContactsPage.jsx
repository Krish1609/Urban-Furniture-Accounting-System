import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAccounting } from '../context/AccountingContext';
import {
  Users,
  Plus,
  ArrowLeft,
  List,
  LayoutGrid,
  Search,
  Check,
  Mail,
  Phone,
  MapPin,
  Camera,
  Image as ImageIcon,
  Edit2,
  Trash2,
  CheckCircle2,
  Building,
  Upload
} from 'lucide-react';
import SearchBar from '../components/SearchBar';

export default function ContactsPage() {
  const { theme } = useTheme();
  const { contacts, addContact, updateContact, deleteContact } = useAccounting();
  const navigate = useNavigate();

  // View mode: 'list' | 'kanban' | 'form'
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState([]);
  const [editingContactId, setEditingContactId] = useState(null);
  const [notification, setNotification] = useState(null);

  // Form State matching the user's Contact Master Form View drawing
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    type: 'Customer',
    imageUrl: '',
  });

  const showToast = (text) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 3000);
  };

  // Reset form to clean state for new contact
  const handleNewClick = () => {
    setEditingContactId(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      type: 'Customer',
      imageUrl: '',
    });
    setViewMode('form');
  };

  // Open existing contact in Form View for editing
  const handleEditContact = (contact) => {
    setEditingContactId(contact.id);
    setFormData({
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || contact.mobile || '',
      street: contact.street || '',
      city: contact.city || '',
      state: contact.state || '',
      country: contact.country || 'India',
      pincode: contact.pincode || '',
      type: contact.type || 'Customer',
      imageUrl: contact.imageUrl || contact.image || '',
    });
    setViewMode('form');
  };

  // Confirm / Save Contact (Form View)
  const handleConfirmSave = (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      alert('Contact Name is required');
      return;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      alert('Please enter a valid email address (e.g. contact@company.in or name@gmail.com)');
      return;
    }

    const payload = {
      ...formData,
      email: formData.email ? formData.email.trim().toLowerCase() : '',
      mobile: formData.phone,
      image: formData.imageUrl,
    };

    if (editingContactId) {
      updateContact(editingContactId, payload);
      showToast(`Contact "${formData.name}" updated successfully in MySQL!`);
    } else {
      addContact(payload);
      showToast(`Contact "${formData.name}" created successfully in MySQL!`);
    }

    setViewMode('list');
    setEditingContactId(null);
  };

  // Back button handler
  const handleBackClick = () => {
    if (viewMode === 'form') {
      setViewMode('list');
    } else {
      navigate('/dashboard');
    }
  };

  // Checkbox select all / toggle
  const filteredContacts = (contacts || []).filter((c) => {
    if (!c) return false;
    const q = searchQuery.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.mobile && c.mobile.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q))
    );
  });

  const handleToggleSelect = (id) => {
    setSelectedContactIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedContactIds.length === filteredContacts.length) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(filteredContacts.map((c) => c.id));
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
          1. FORM VIEW (Contact master Form View)
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

          <div style={{ marginBottom: '1.2rem' }}>
            <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.4rem', fontWeight: 600, color: theme.textMain }}>
              {editingContactId ? 'Edit Contact' : 'Contact Master'}
            </h2>
            <span style={{ fontSize: '0.8rem', color: theme.textMuted }}>
              Enter contact credentials and address details
            </span>
          </div>

          {/* Form Content matching Drawing Layout */}
          <form onSubmit={handleConfirmSave} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }}>
            {/* Left Column: Contact Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {/* Contact Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ width: '130px', fontSize: '0.86rem', fontWeight: 600, color: theme.textMain }}>
                  Contact Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Open Wood or Joey Wills"
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

              {/* Email */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ width: '130px', fontSize: '0.86rem', fontWeight: 600, color: theme.textMain }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. contact@godrejinterio.in or aarav.sharma@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

              {/* Phone */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ width: '130px', fontSize: '0.86rem', fontWeight: 600, color: theme.textMain }}>
                  Phone
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 9090090909"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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

              {/* Address Section */}
              <div style={{ borderTop: `1px solid ${theme.borderLight}`, paddingTop: '1rem', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: theme.accentGold, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.8rem' }}>
                  Address
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {/* Street */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label style={{ width: '130px', fontSize: '0.82rem', color: theme.textMuted }}>Street</label>
                    <input
                      type="text"
                      placeholder="Street Address, Building, Floor"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      style={{
                        flex: 1,
                        padding: '0.65rem 0.85rem',
                        borderRadius: '6px',
                        border: `1px solid ${theme.borderLight}`,
                        backgroundColor: theme.bgInput,
                        color: theme.textMain,
                        outline: 'none',
                        fontSize: '0.84rem',
                      }}
                    />
                  </div>

                  {/* City & State */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <label style={{ width: '60px', fontSize: '0.82rem', color: theme.textMuted }}>City</label>
                      <input
                        type="text"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        style={{
                          flex: 1,
                          padding: '0.65rem 0.85rem',
                          borderRadius: '6px',
                          border: `1px solid ${theme.borderLight}`,
                          backgroundColor: theme.bgInput,
                          color: theme.textMain,
                          outline: 'none',
                          fontSize: '0.84rem',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <label style={{ width: '60px', fontSize: '0.82rem', color: theme.textMuted }}>State</label>
                      <input
                        type="text"
                        placeholder="State"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        style={{
                          flex: 1,
                          padding: '0.65rem 0.85rem',
                          borderRadius: '6px',
                          border: `1px solid ${theme.borderLight}`,
                          backgroundColor: theme.bgInput,
                          color: theme.textMain,
                          outline: 'none',
                          fontSize: '0.84rem',
                        }}
                      />
                    </div>
                  </div>

                  {/* Country & Pincode */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <label style={{ width: '60px', fontSize: '0.82rem', color: theme.textMuted }}>Country</label>
                      <input
                        type="text"
                        placeholder="Country"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        style={{
                          flex: 1,
                          padding: '0.65rem 0.85rem',
                          borderRadius: '6px',
                          border: `1px solid ${theme.borderLight}`,
                          backgroundColor: theme.bgInput,
                          color: theme.textMain,
                          outline: 'none',
                          fontSize: '0.84rem',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <label style={{ width: '60px', fontSize: '0.82rem', color: theme.textMuted }}>Pincode</label>
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        style={{
                          flex: 1,
                          padding: '0.65rem 0.85rem',
                          borderRadius: '6px',
                          border: `1px solid ${theme.borderLight}`,
                          backgroundColor: theme.bgInput,
                          color: theme.textMain,
                          outline: 'none',
                          fontSize: '0.84rem',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Upload Avatar Box & Presets */}
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
                    alt="Contact Preview"
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
                      Upload Contact / Logo
                    </span>
                    <span style={{ fontSize: '0.7rem', color: theme.textDim }}>PNG, JPG or SVG</span>
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
                  ✕ Remove Photo
                </button>
              )}

              {/* Or Paste Avatar URL */}
              <div style={{ width: '100%', maxWidth: '280px' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: theme.textDim, marginBottom: '0.3rem' }}>
                  Or Paste Avatar URL:
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

              {/* Quick Sample Avatar Presets */}
              <div style={{ width: '100%', maxWidth: '280px' }}>
                <span style={{ display: 'block', fontSize: '0.72rem', color: theme.textDim, marginBottom: '0.4rem', fontWeight: 600 }}>
                  Quick Avatars:
                </span>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {[
                    { label: '🏢 Corporate', url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=500&auto=format&fit=crop&q=60' },
                    { label: '👨‍💼 Executive', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60' },
                    { label: '👩‍💼 Architect', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=60' },
                    { label: '🏭 Supplier', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60' },
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
          2. LIST & KANBAN VIEWS (Contact List View / Contact Kanban View)
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
              placeholder="Search contacts by name, email, phone..."
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
                        checked={selectedContactIds.length === filteredContacts.length && filteredContacts.length > 0}
                        onChange={handleSelectAll}
                        style={{ accentColor: theme.accentGold, cursor: 'pointer' }}
                      />
                    </th>
                    <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Image</th>
                    <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                    <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                    <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</th>
                    <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((cnt) => {
                    const isSelected = selectedContactIds.includes(cnt.id);

                    return (
                      <tr
                        key={cnt.id}
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
                            onChange={() => handleToggleSelect(cnt.id)}
                            style={{ accentColor: theme.accentGold, cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '6px',
                              backgroundColor: theme.bgSubtle,
                              border: `1px solid ${theme.borderLight}`,
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {cnt.imageUrl || cnt.image ? (
                              <img src={cnt.imageUrl || cnt.image} alt={cnt.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <Users size={18} style={{ color: theme.accentGold }} />
                            )}
                          </div>
                        </td>
                        <td
                          onClick={() => handleEditContact(cnt)}
                          style={{ padding: '0.85rem 1rem', fontWeight: 600, color: theme.textMain, cursor: 'pointer' }}
                        >
                          {cnt.name}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: theme.textMuted }}>
                          {cnt.email}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: theme.textMuted }}>
                          {cnt.phone || cnt.mobile}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleEditContact(cnt)}
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
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.2rem',
              }}
            >
              {filteredContacts.map((cnt) => (
                <div
                  key={cnt.id}
                  onClick={() => handleEditContact(cnt)}
                  style={{
                    backgroundColor: theme.bgSubtle,
                    border: `1.5px solid ${theme.borderLight}`,
                    borderRadius: '12px',
                    padding: '1.2rem 1.4rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.1rem',
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
                  {/* Left: Contact Photo/Logo */}
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
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
                    {cnt.imageUrl || cnt.image ? (
                      <img src={cnt.imageUrl || cnt.image} alt={cnt.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Users size={28} style={{ color: theme.accentGold }} />
                    )}
                  </div>

                  {/* Right: Contact Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflow: 'hidden' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: theme.textMain, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {cnt.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: theme.textMuted }}>
                      <Mail size={12} style={{ color: theme.accentGold, flexShrink: 0 }} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cnt.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: theme.textMuted }}>
                      <Phone size={12} style={{ color: theme.accentGold, flexShrink: 0 }} />
                      <span>{cnt.phone || cnt.mobile}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
