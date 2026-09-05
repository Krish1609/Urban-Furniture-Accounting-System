import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Shield,
  Users,
  UserCheck,
  UserPlus,
  Search,
  RefreshCw,
  Edit2,
  KeyRound,
  Trash2,
  Lock,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  X,
  Building,
  UserCog
} from 'lucide-react';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';

export default function UsersPage() {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'Administrator' | 'Accountant' | 'User'

  // Toast / Status banner
  const [statusMessage, setStatusMessage] = useState(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editUserModal, setEditUserModal] = useState(null);
  const [resetPwdModal, setResetPwdModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  // New User Form State
  const [newForm, setNewForm] = useState({
    name: '',
    loginId: '',
    email: '',
    role: 'Accountant', // 'Accountant' | 'User'
    password: 'Password@123',
    phone: '',
  });

  // Edit User Form State
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'Accountant',
    phone: '',
    isActive: true,
  });

  const showToast = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Fetch all users from live backend
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getAllUsers();
      if (Array.isArray(data)) {
        setUsersList(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      showToast('error', 'Failed to load user directory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Statistics
  const totalUsers = usersList.length;
  const adminCount = usersList.filter((u) => u.role === 'Administrator' || u.role === 'admin').length;
  const accountantCount = usersList.filter((u) => u.role === 'Accountant' || u.role === 'accountant').length;
  const standardUserCount = usersList.filter((u) => u.role === 'User' || u.role === 'user').length;

  // Filtered users
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.loginId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.role || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (roleFilter === 'all') return true;
    if (roleFilter === 'Administrator') return u.role === 'Administrator' || u.role === 'admin';
    if (roleFilter === 'Accountant') return u.role === 'Accountant' || u.role === 'accountant';
    if (roleFilter === 'User') return u.role === 'User' || u.role === 'user';
    return true;
  });

  // Handle Create User
  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.registerUser(newForm);
      showToast('success', `Created user ${newForm.name} (${newForm.role}) successfully`);
      setIsAddModalOpen(false);
      setNewForm({
        name: '',
        loginId: '',
        email: '',
        role: 'Accountant',
        password: 'Password@123',
        phone: '',
      });
      fetchUsers();
    } catch (err) {
      showToast('error', err.message || 'Failed to create user account');
    }
  };

  // Handle Update User
  const handleUpdateUserSubmit = async (e) => {
    e.preventDefault();
    if (!editUserModal) return;
    try {
      await api.updateUser(editUserModal.id, editForm);
      showToast('success', `Updated user ${editForm.name} successfully`);
      setEditUserModal(null);
      fetchUsers();
    } catch (err) {
      showToast('error', err.message || 'Failed to update user');
    }
  };

  // Handle Password Reset
  const handlePasswordReset = async (id, name) => {
    try {
      await api.resetUserPassword(id, 'Password@123');
      showToast('success', `Password for ${name} reset to "Password@123"`);
      setResetPwdModal(null);
    } catch (err) {
      showToast('error', err.message || 'Failed to reset password');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (id, name) => {
    try {
      await api.deleteUser(id);
      showToast('success', `User ${name} removed from system`);
      setDeleteModal(null);
      fetchUsers();
    } catch (err) {
      showToast('error', err.message || 'Failed to delete user');
    }
  };

  // Handle Toggle Active Status
  const handleToggleStatus = async (user) => {
    if (user.role === 'Administrator' || user.loginId === 'admin') {
      showToast('error', 'The primary Administrator account cannot be disabled');
      return;
    }
    try {
      await api.updateUser(user.id, { isActive: !user.isActive });
      showToast('success', `${user.name} is now ${!user.isActive ? 'Active' : 'Suspended'}`);
      fetchUsers();
    } catch (err) {
      showToast('error', err.message || 'Failed to update status');
    }
  };

  const isSuperAdmin = currentUser?.role === 'Administrator' || currentUser?.role === 'admin';

  return (
    <div style={{ color: theme.textMain, maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
      {/* 1. TOP HEADER BANNER */}
      <div
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.borderLight}`,
          borderRadius: '12px',
          padding: '1.8rem 2rem',
          boxShadow: theme.shadow,
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Shield size={24} style={{ color: theme.accentGold }} />
              <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.45rem', fontWeight: 600, color: theme.textMain, margin: 0 }}>
                User &amp; Team Management
              </h1>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  backgroundColor: theme.accentGoldSoft,
                  color: theme.accentGold,
                  border: `1px solid ${theme.borderLight}`,
                }}
              >
                Super Admin Console
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: theme.textMuted, marginTop: '0.25rem', marginBottom: 0 }}>
              Centralized Administrator hub to manage Accountants, Clients, Staff roles, security permissions, and credentials.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={fetchUsers}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: theme.bgSubtle,
                color: theme.textMain,
                border: `1px solid ${theme.borderLight}`,
                padding: '0.55rem 0.95rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: theme.accentGold,
                  color: '#0E0D0C',
                  border: 'none',
                  padding: '0.55rem 1.1rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }}
              >
                <UserPlus size={15} />
                <span>+ Add User / Accountant</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Toast Banner */}
        {statusMessage && (
          <div
            style={{
              marginTop: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              fontSize: '0.82rem',
              backgroundColor: statusMessage.type === 'error' ? theme.errorBg : theme.successBg,
              border: `1px solid ${statusMessage.type === 'error' ? theme.error : theme.success}`,
              color: statusMessage.type === 'error' ? theme.error : theme.success,
            }}
          >
            {statusMessage.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* 2. KPI METRICS CARDS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '1.4rem',
          }}
        >
          {/* Total Users */}
          <div style={{ padding: '1.1rem', backgroundColor: theme.bgSubtle, borderRadius: '8px', border: `1px solid ${theme.borderLight}` }}>
            <span style={{ fontSize: '0.76rem', color: theme.textMuted, display: 'block', marginBottom: '0.2rem' }}>Total Accounts</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: theme.textMain }}>{totalUsers}</span>
              <Users size={20} style={{ color: theme.textDim }} />
            </div>
          </div>

          {/* Single Admin */}
          <div style={{ padding: '1.1rem', backgroundColor: theme.bgSubtle, borderRadius: '8px', border: `1px solid ${theme.borderLight}` }}>
            <span style={{ fontSize: '0.76rem', color: theme.textMuted, display: 'block', marginBottom: '0.2rem' }}>👑 Administrator</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: theme.accentGold }}>{adminCount}</span>
              <span style={{ fontSize: '0.72rem', color: theme.accentGold, fontWeight: 700 }}>Single Protected</span>
            </div>
          </div>

          {/* Multiple Accountants */}
          <div style={{ padding: '1.1rem', backgroundColor: theme.bgSubtle, borderRadius: '8px', border: `1px solid ${theme.borderLight}` }}>
            <span style={{ fontSize: '0.76rem', color: theme.textMuted, display: 'block', marginBottom: '0.2rem' }}>💼 Active Accountants</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>{accountantCount}</span>
              <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>Full ERP Access</span>
            </div>
          </div>

          {/* Multiple Users / Clients */}
          <div style={{ padding: '1.1rem', backgroundColor: theme.bgSubtle, borderRadius: '8px', border: `1px solid ${theme.borderLight}` }}>
            <span style={{ fontSize: '0.76rem', color: theme.textMuted, display: 'block', marginBottom: '0.2rem' }}>👥 Clients &amp; Portal Users</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>{standardUserCount}</span>
              <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>Portal Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CONTROLS BAR: SEARCH & TABS */}
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
          padding: '1rem 1.4rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Role Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All Users (${totalUsers})` },
            { id: 'Administrator', label: `👑 Administrator (${adminCount})` },
            { id: 'Accountant', label: `💼 Accountants (${accountantCount})` },
            { id: 'User', label: `👥 Users (${standardUserCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRoleFilter(tab.id)}
              style={{
                padding: '0.45rem 0.95rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: roleFilter === tab.id ? `1px solid ${theme.accentGold}` : `1px solid ${theme.borderLight}`,
                backgroundColor: roleFilter === tab.id ? theme.accentGoldSoft : theme.bgSubtle,
                color: roleFilter === tab.id ? theme.accentGold : theme.textMain,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={() => setSearchTerm('')}
          placeholder="Search by name, login, email..."
          width="280px"
        />
      </div>

      {/* 4. USER DIRECTORY TABLE */}
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
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ backgroundColor: theme.bgSubtle, borderBottom: `2px solid ${theme.borderLight}` }}>
                <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  User Profile
                </th>
                <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  Login ID
                </th>
                <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  Email &amp; Contact
                </th>
                <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  System Role
                </th>
                <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  Status
                </th>
                <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>
                  Admin Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: theme.textMuted }}>
                    {loading ? 'Loading users directory...' : 'No users match the selected search or filter.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isAdmin = user.role === 'Administrator' || user.role === 'admin' || user.loginId === 'admin';
                  const isAccountant = user.role === 'Accountant' || user.role === 'accountant';

                  return (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: `1px solid ${theme.borderLight}`,
                        color: theme.textMain,
                        transition: 'background-color 150ms ease',
                      }}
                    >
                      {/* Name & Avatar */}
                      <td style={{ padding: '1rem 1.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              backgroundColor: isAdmin ? theme.accentGoldSoft : isAccountant ? '#38bdf820' : '#34d39920',
                              color: isAdmin ? theme.accentGold : isAccountant ? '#38bdf8' : '#34d399',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              border: `1px solid ${isAdmin ? theme.accentGold : isAccountant ? '#38bdf8' : '#34d399'}`,
                            }}
                          >
                            {(user.name || user.loginId || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span style={{ fontWeight: 600, color: theme.textMain, display: 'block' }}>
                              {user.name || user.loginId}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: theme.textDim }}>
                              {isAdmin ? 'System Owner & Super Admin' : isAccountant ? 'Accounting & Financial Officer' : 'Portal Client / Customer'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Login ID */}
                      <td style={{ padding: '1rem 1.2rem', fontFamily: 'monospace', fontWeight: 600, color: theme.accentGold }}>
                        {user.loginId}
                      </td>

                      {/* Email & Phone */}
                      <td style={{ padding: '1rem 1.2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <span style={{ fontSize: '0.82rem', color: theme.textMain }}>{user.email}</span>
                          {user.phone && (
                            <span style={{ fontSize: '0.72rem', color: theme.textMuted }}>{user.phone}</span>
                          )}
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td style={{ padding: '1rem 1.2rem' }}>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            padding: '0.25rem 0.65rem',
                            borderRadius: '4px',
                            backgroundColor: isAdmin ? theme.accentGoldSoft : isAccountant ? '#38bdf820' : '#34d39920',
                            color: isAdmin ? theme.accentGold : isAccountant ? '#38bdf8' : '#34d399',
                            border: `1px solid ${theme.borderLight}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          {isAdmin && '👑'} {isAccountant && '💼'} {!isAdmin && !isAccountant && '👥'} {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '1rem 1.2rem' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            backgroundColor: user.isActive !== false ? '#10b98120' : '#ef444420',
                            color: user.isActive !== false ? '#34d399' : '#f87171',
                            border: `1px solid ${theme.borderLight}`,
                          }}
                        >
                          {user.isActive !== false ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      {/* Admin Actions */}
                      <td style={{ padding: '1rem 1.2rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.45rem' }}>
                          {/* Edit User Button */}
                          <button
                            type="button"
                            title="Edit User Details & Role"
                            onClick={() => {
                              setEditUserModal(user);
                              setEditForm({
                                name: user.name || '',
                                email: user.email || '',
                                role: user.role || 'Accountant',
                                phone: user.phone || '',
                                isActive: user.isActive !== false,
                              });
                            }}
                            style={{
                              padding: '0.35rem 0.65rem',
                              backgroundColor: theme.bgSubtle,
                              color: theme.textMain,
                              border: `1px solid ${theme.borderLight}`,
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            <Edit2 size={12} />
                            <span>Edit</span>
                          </button>

                          {/* Reset Password Button */}
                          <button
                            type="button"
                            title="Reset password to default (Password@123)"
                            onClick={() => handlePasswordReset(user.id, user.name || user.loginId)}
                            style={{
                              padding: '0.35rem 0.65rem',
                              backgroundColor: theme.bgSubtle,
                              color: theme.accentGold,
                              border: `1px solid ${theme.borderLight}`,
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            <KeyRound size={12} />
                            <span>Reset Pwd</span>
                          </button>

                          {/* Toggle Active / Suspended */}
                          {!isAdmin && (
                            <button
                              type="button"
                              title={user.isActive !== false ? 'Suspend User Access' : 'Activate User'}
                              onClick={() => handleToggleStatus(user)}
                              style={{
                                padding: '0.35rem 0.65rem',
                                backgroundColor: theme.bgSubtle,
                                color: user.isActive !== false ? '#f87171' : '#34d399',
                                border: `1px solid ${theme.borderLight}`,
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              {user.isActive !== false ? 'Suspend' : 'Activate'}
                            </button>
                          )}

                          {/* Delete User Button (Non-Admin only) */}
                          {!isAdmin && (
                            <button
                              type="button"
                              title="Delete User"
                              onClick={() => setDeleteModal(user)}
                              style={{
                                padding: '0.35rem 0.55rem',
                                backgroundColor: '#ef444415',
                                color: '#ef4444',
                                border: '1px solid #ef444430',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW USER / ACCOUNTANT                                        */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <Modal title="Create New Accountant or User" onClose={() => setIsAddModalOpen(false)}>
          <form onSubmit={handleCreateUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '0.75rem 1rem', backgroundColor: theme.bgSubtle, borderRadius: '6px', border: `1px solid ${theme.borderLight}`, fontSize: '0.78rem', color: theme.textMuted }}>
              👑 <strong>System Role Rule:</strong> The system operates under 1 central Administrator. You can add multiple <strong>Accountants</strong> (with complete ERP ledger access) and <strong>Users</strong> (with client portal access).
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: theme.textMain, display: 'block', marginBottom: '0.3rem' }}>
                Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={newForm.name}
                onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.86rem',
                  backgroundColor: theme.bgInput,
                  color: theme.textMain,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '5px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: theme.textMain, display: 'block', marginBottom: '0.3rem' }}>
                  Login ID *
                </label>
                <input
                  type="text"
                  placeholder="e.g. rahul_acc"
                  value={newForm.loginId}
                  onChange={(e) => setNewForm({ ...newForm, loginId: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.86rem',
                    backgroundColor: theme.bgInput,
                    color: theme.textMain,
                    border: `1px solid ${theme.borderLight}`,
                    borderRadius: '5px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: theme.textMain, display: 'block', marginBottom: '0.3rem' }}>
                  Role *
                </label>
                <select
                  value={newForm.role}
                  onChange={(e) => setNewForm({ ...newForm, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.86rem',
                    backgroundColor: theme.bgInput,
                    color: theme.textMain,
                    border: `1px solid ${theme.borderLight}`,
                    borderRadius: '5px',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="Accountant">💼 Accountant (ERP Access)</option>
                  <option value="User">👥 User (Client Portal Access)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: theme.textMain, display: 'block', marginBottom: '0.3rem' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="user@urbanfurniture.com"
                  value={newForm.email}
                  onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.86rem',
                    backgroundColor: theme.bgInput,
                    color: theme.textMain,
                    border: `1px solid ${theme.borderLight}`,
                    borderRadius: '5px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: theme.textMain, display: 'block', marginBottom: '0.3rem' }}>
                  Initial Password *
                </label>
                <input
                  type="text"
                  placeholder="Password@123"
                  value={newForm.password}
                  onChange={(e) => setNewForm({ ...newForm, password: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.86rem',
                    backgroundColor: theme.bgInput,
                    color: theme.textMain,
                    border: `1px solid ${theme.borderLight}`,
                    borderRadius: '5px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: theme.textMain, display: 'block', marginBottom: '0.3rem' }}>
                Phone Number (Optional)
              </label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={newForm.phone}
                onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.86rem',
                  backgroundColor: theme.bgInput,
                  color: theme.textMain,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '5px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.8rem' }}>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{
                  padding: '0.6rem 1.2rem',
                  borderRadius: '6px',
                  border: `1px solid ${theme.borderLight}`,
                  backgroundColor: 'transparent',
                  color: theme.textMuted,
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '0.6rem 1.5rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: theme.accentGold,
                  color: '#0E0D0C',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Create Account
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT USER INFO & ROLE                                            */}
      {/* ========================================================================= */}
      {editUserModal && (
        <Modal title={`Edit Profile: ${editUserModal.name || editUserModal.loginId}`} onClose={() => setEditUserModal(null)}>
          <form onSubmit={handleUpdateUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: theme.textMain, display: 'block', marginBottom: '0.3rem' }}>
                Full Name
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.86rem',
                  backgroundColor: theme.bgInput,
                  color: theme.textMain,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '5px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: theme.textMain, display: 'block', marginBottom: '0.3rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.86rem',
                    backgroundColor: theme.bgInput,
                    color: theme.textMain,
                    border: `1px solid ${theme.borderLight}`,
                    borderRadius: '5px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: theme.textMain, display: 'block', marginBottom: '0.3rem' }}>
                  Role
                </label>
                <select
                  value={editForm.role}
                  disabled={editUserModal.role === 'Administrator' || editUserModal.loginId === 'admin'}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.86rem',
                    backgroundColor: theme.bgInput,
                    color: theme.textMain,
                    border: `1px solid ${theme.borderLight}`,
                    borderRadius: '5px',
                    outline: 'none',
                    cursor: editUserModal.role === 'Administrator' ? 'not-allowed' : 'pointer',
                  }}
                >
                  {editUserModal.role === 'Administrator' && (
                    <option value="Administrator">👑 Administrator</option>
                  )}
                  <option value="Accountant">💼 Accountant (ERP Access)</option>
                  <option value="User">👥 User (Client Portal Access)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: theme.textMain, display: 'block', marginBottom: '0.3rem' }}>
                Phone Number
              </label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.86rem',
                  backgroundColor: theme.bgInput,
                  color: theme.textMain,
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: '5px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.8rem' }}>
              <button
                type="button"
                onClick={() => setEditUserModal(null)}
                style={{
                  padding: '0.6rem 1.2rem',
                  borderRadius: '6px',
                  border: `1px solid ${theme.borderLight}`,
                  backgroundColor: 'transparent',
                  color: theme.textMuted,
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '0.6rem 1.5rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: theme.accentGold,
                  color: '#0E0D0C',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DELETE USER CONFIRMATION                                         */}
      {/* ========================================================================= */}
      {deleteModal && (
        <Modal title="Confirm Delete User" onClose={() => setDeleteModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.88rem', color: theme.textMain, margin: 0 }}>
              Are you sure you want to delete user <strong>{deleteModal.name || deleteModal.loginId}</strong> ({deleteModal.email})?
            </p>
            <p style={{ fontSize: '0.78rem', color: '#ef4444', margin: 0 }}>
              This action cannot be undone. All user permissions will be revoked immediately.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.6rem' }}>
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                style={{
                  padding: '0.55rem 1.1rem',
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
                type="button"
                onClick={() => handleDeleteUser(deleteModal.id, deleteModal.name || deleteModal.loginId)}
                style={{
                  padding: '0.55rem 1.3rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Delete User
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
