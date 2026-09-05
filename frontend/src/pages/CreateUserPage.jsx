import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function CreateUserPage() {
  const { theme } = useTheme();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [loginId, setLoginId] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('User'); // 'User' | 'Administrator'
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Validation Rules
  const isLoginIdValid = loginId.trim().length >= 6 && loginId.trim().length <= 12;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const hasMinLength = password.length > 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = hasMinLength && hasLower && hasUpper && hasSpecial;
  const isPasswordMatch = password.length > 0 && password === confirmPassword;

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter your Full Name.' });
      return;
    }
    if (!isLoginIdValid) {
      setStatusMessage({ type: 'error', text: 'Login ID must be between 6 and 12 characters.' });
      return;
    }
    if (!isEmailValid) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    if (!isPasswordValid) {
      setStatusMessage({ type: 'error', text: 'Password must be >8 characters with uppercase, lowercase & special character.' });
      return;
    }
    if (!isPasswordMatch) {
      setStatusMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    try {
      await register({ name, loginId, email, role, password });
      setStatusMessage({ type: 'success', text: `Account created for ${name}! Redirecting to Sign In...` });
      setTimeout(() => {
        navigate('/login');
      }, 800);
    } catch (error) {
      setStatusMessage({ type: 'error', text: error.message || 'Unable to create the account.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/login');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: theme.bgApp,
        color: theme.textMain,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2.5rem 1.25rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '450px',
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.borderLight}`,
          borderRadius: '10px',
          padding: '2.4rem 2.2rem',
          boxShadow: theme.shadow,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.6rem' }}>
          <Logo theme={theme} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.65rem', fontWeight: 500, color: theme.textMain, marginBottom: '0.25rem' }}>
            Create User
          </h1>
          <p style={{ fontSize: '0.84rem', color: theme.textMuted }}>
            Register a new user account for FurniLedger
          </p>
        </div>

        {statusMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.75rem 0.9rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              marginBottom: '1rem',
              backgroundColor: statusMessage.type === 'error' ? theme.errorBg : theme.successBg,
              border: `1px solid ${statusMessage.type === 'error' ? theme.error : theme.success}`,
              color: statusMessage.type === 'error' ? theme.error : theme.success,
            }}
          >
            {statusMessage.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.05rem' }} onSubmit={handleCreateUser}>
          {/* Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: theme.textMain }}>Name</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <UserIcon size={15} style={{ position: 'absolute', left: '0.85rem', color: theme.textDim }} />
              <input
                type="text"
                placeholder="Enter full name"
                value={name}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.45rem',
                  fontSize: '0.88rem',
                  backgroundColor: theme.bgInput,
                  color: theme.textMain,
                  border: `1px solid ${focusedField === 'name' ? theme.borderFocus : theme.borderLight}`,
                  borderRadius: '5px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Login ID */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: theme.textMain }}>Login id</label>
              <span style={{ fontSize: '0.7rem', color: isLoginIdValid ? theme.success : theme.textDim }}>
                6–12 characters
              </span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <UserIcon size={15} style={{ position: 'absolute', left: '0.85rem', color: theme.textDim }} />
              <input
                type="text"
                placeholder="e.g. admin_demo"
                value={loginId}
                onFocus={() => setFocusedField('loginId')}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => setLoginId(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.45rem',
                  fontSize: '0.88rem',
                  backgroundColor: theme.bgInput,
                  color: theme.textMain,
                  border: `1px solid ${focusedField === 'loginId' ? theme.borderFocus : theme.borderLight}`,
                  borderRadius: '5px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* E-mail id */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: theme.textMain }}>E-mail id</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={15} style={{ position: 'absolute', left: '0.85rem', color: theme.textDim }} />
              <input
                type="email"
                placeholder="user@urbanfurniture.com"
                value={email}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.45rem',
                  fontSize: '0.88rem',
                  backgroundColor: theme.bgInput,
                  color: theme.textMain,
                  border: `1px solid ${focusedField === 'email' ? theme.borderFocus : theme.borderLight}`,
                  borderRadius: '5px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Role Radio Group */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.2rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: theme.textMain }}>Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', backgroundColor: theme.bgSubtle, padding: '0.3rem', borderRadius: '6px', border: `1px solid ${theme.borderLight}` }}>
              <button
                type="button"
                onClick={() => setRole('User')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 0.6rem',
                  borderRadius: '4px',
                  border: role === 'User' ? `1px solid ${theme.borderLight}` : '1px solid transparent',
                  backgroundColor: role === 'User' ? theme.bgCard : 'transparent',
                  color: role === 'User' ? theme.textMain : theme.textMuted,
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: `1.5px solid ${role === 'User' ? theme.accentGold : theme.borderLight}`, backgroundColor: role === 'User' ? theme.accentGold : 'transparent' }} />
                <span>User</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('Administrator')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 0.6rem',
                  borderRadius: '4px',
                  border: role === 'Administrator' ? `1px solid ${theme.borderLight}` : '1px solid transparent',
                  backgroundColor: role === 'Administrator' ? theme.bgCard : 'transparent',
                  color: role === 'Administrator' ? theme.textMain : theme.textMuted,
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: `1.5px solid ${role === 'Administrator' ? theme.accentGold : theme.borderLight}`, backgroundColor: role === 'Administrator' ? theme.accentGold : 'transparent' }} />
                <span>Administrator</span>
              </button>
            </div>
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: theme.textMain }}>Password</label>
              <span style={{ fontSize: '0.7rem', color: isPasswordValid ? theme.success : theme.textDim }}>
                &gt;8 chars, aA@
              </span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={15} style={{ position: 'absolute', left: '0.85rem', color: theme.textDim }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Uppercase, lowercase & symbol"
                value={password}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.45rem',
                  fontSize: '0.88rem',
                  backgroundColor: theme.bgInput,
                  color: theme.textMain,
                  border: `1px solid ${focusedField === 'password' ? theme.borderFocus : theme.borderLight}`,
                  borderRadius: '5px',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '0.75rem', background: 'transparent', border: 'none', color: theme.textDim, cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Re-Enter Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: theme.textMain }}>Re-Enter Password</label>
              {confirmPassword && (
                <span style={{ fontSize: '0.7rem', color: isPasswordMatch ? theme.success : theme.error }}>
                  {isPasswordMatch ? 'Match' : 'Mismatch'}
                </span>
              )}
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={15} style={{ position: 'absolute', left: '0.85rem', color: theme.textDim }} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={confirmPassword}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.45rem',
                  fontSize: '0.88rem',
                  backgroundColor: theme.bgInput,
                  color: theme.textMain,
                  border: `1px solid ${focusedField === 'confirmPassword' ? theme.borderFocus : theme.borderLight}`,
                  borderRadius: '5px',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: 'absolute', right: '0.75rem', background: 'transparent', border: 'none', color: theme.textDim, cursor: 'pointer' }}
              >
                {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.85rem', marginTop: '0.6rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1.4rem',
                backgroundColor: theme.accentGold,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '5px',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              <span>{loading ? 'Creating...' : 'Create'}</span>
              {!loading && <ArrowRight size={15} />}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: '0.85rem 1.4rem',
                backgroundColor: 'transparent',
                color: theme.textMuted,
                border: `1px solid ${theme.borderLight}`,
                borderRadius: '5px',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.76rem', color: theme.textDim }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: theme.accentGold, fontWeight: 600, textDecoration: 'none' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
