import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function LoginPage() {
  const { theme } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loginId, setLoginId] = useState('admin_demo');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!loginId.trim() || !password.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter your Login ID / Email and Password.' });
      return;
    }

    setLoading(true);
    try {
      const response = await login(loginId, password);
      const userRole = response.role ?? response.user?.role ?? 'Administrator';
      setStatusMessage({ type: 'success', text: `Welcome to FurniLedger! Signed in as ${userRole}.` });
      navigate(userRole === 'User' || userRole === 'USER' ? '/my-invoices' : '/dashboard', { replace: true });
    } catch (error) {
      setStatusMessage({ type: 'error', text: error.message || 'Unable to sign in.' });
    } finally {
      setLoading(false);
    }
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
          maxWidth: '430px',
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.borderLight}`,
          borderRadius: '10px',
          padding: '2.5rem 2.25rem',
          boxShadow: theme.shadow,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.6rem' }}>
          <Logo theme={theme} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.65rem', fontWeight: 500, color: theme.textMain, marginBottom: '0.25rem' }}>
            Sign In
          </h1>
          <p style={{ fontSize: '0.84rem', color: theme.textMuted }}>
            Access your furniture accounting portal
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

        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }} onSubmit={handleLoginSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: theme.textMain }}>Login ID or E-mail</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <UserIcon size={15} style={{ position: 'absolute', left: '0.85rem', color: theme.textDim }} />
              <input
                type="text"
                placeholder="Enter login id or email"
                value={loginId}
                onFocus={() => setFocusedField('loginId')}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => setLoginId(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.78rem 1rem 0.78rem 2.45rem',
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: theme.textMain }}>Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={15} style={{ position: 'absolute', left: '0.85rem', color: theme.textDim }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.78rem 1rem 0.78rem 2.45rem',
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

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: theme.textMuted, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: theme.accentGold }}
            />
            <span>Remember me on this device</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.55rem',
              width: '100%',
              padding: '0.88rem 1.4rem',
              backgroundColor: theme.accentGold,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '5px',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            <span>{loading ? 'Authenticating...' : 'Sign in'}</span>
            {!loading && <ArrowRight size={15} />}
          </button>
        </form>

        <p style={{ marginTop: '1.6rem', textAlign: 'center', fontSize: '0.76rem', color: theme.textDim }}>
          Need an account?{' '}
          <Link to="/create-user" style={{ color: theme.accentGold, fontWeight: 600, textDecoration: 'none' }}>
            Create User
          </Link>
        </p>
      </div>
    </div>
  );
}
