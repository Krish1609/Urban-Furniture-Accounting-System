import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Mail,
  KeyRound,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import Modal from '../components/Modal';
import { api } from '../services/api';

export default function LoginPage() {
  const { theme } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState('Administrator'); // 'Administrator' | 'User'
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState('request'); // 'request' | 'verify' | 'success'
  const [forgotLoginOrEmail, setForgotLoginOrEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    if (location.state?.message) {
      setStatusMessage({ type: 'success', text: location.state.message });
    }
  }, [location]);

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    setStatusMessage(null);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!loginId.trim() || !password.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter your Login ID / Email and Password.' });
      return;
    }

    setLoading(true);
    try {
      const result = await login(loginId.trim(), password, role);
      setLoading(false);
      const userRole = result?.role || result?.user?.role || role;
      setStatusMessage({ type: 'success', text: `Welcome to FurniLedger! Signed in as ${result?.user?.name || userRole}.` });
      setTimeout(() => {
        if (userRole === 'Administrator') {
          navigate('/admin');
        } else if (userRole === 'User' || userRole === 'USER') {
          navigate('/portal');
        } else {
          navigate('/dashboard');
        }
      }, 500);
    } catch (err) {
      setLoading(false);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Invalid Login ID or Password. Please check your credentials.'
      });
    }
  };

  const handleOpenForgotModal = () => {
    setShowForgotModal(true);
    setForgotStep('request');
    setForgotLoginOrEmail(loginId || '');
    setForgotStatus(null);
    setForgotOtp('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
  };

  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    setForgotStatus(null);
    if (!forgotLoginOrEmail.trim()) {
      setForgotStatus({ type: 'error', text: 'Please enter your Login ID or registered Email address.' });
      return;
    }
    setForgotLoading(true);
    try {
      const res = await api.forgotPassword(forgotLoginOrEmail.trim());
      setForgotLoading(false);
      setMaskedEmail(res.maskedEmail || 'your email');
      setForgotStep('verify');
      setResendTimer(60);
      setForgotStatus({ type: 'success', text: `OTP sent via SMTP to ${res.maskedEmail || 'your email'}!` });
    } catch (err) {
      setForgotLoading(false);
      setForgotStatus({ type: 'error', text: err.message || 'Failed to send OTP. Please check your credentials.' });
    }
  };

  const handleVerifyAndReset = async (e) => {
    e?.preventDefault();
    setForgotStatus(null);
    if (!forgotOtp.trim()) {
      setForgotStatus({ type: 'error', text: 'Please enter the 6-digit OTP code received in your email.' });
      return;
    }
    if (!forgotNewPassword) {
      setForgotStatus({ type: 'error', text: 'Please choose a new password.' });
      return;
    }
    if (forgotNewPassword.length < 6) {
      setForgotStatus({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotStatus({ type: 'error', text: 'Passwords do not match. Please ensure both passwords match.' });
      return;
    }

    setForgotLoading(true);
    try {
      await api.verifyResetOtp({
        loginOrEmail: forgotLoginOrEmail.trim(),
        otp: forgotOtp.trim(),
        newPassword: forgotNewPassword
      });
      setForgotLoading(false);
      setForgotStep('success');
      setStatusMessage({ type: 'success', text: 'Password updated successfully! Please sign in with your new password.' });
      setLoginId(forgotLoginOrEmail.trim());
      setPassword('');
    } catch (err) {
      setForgotLoading(false);
      setForgotStatus({ type: 'error', text: err.message || 'Invalid or expired OTP code.' });
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

        {/* Account Role Toggle: Administrator | Accountant | User */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1.2rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: theme.textDim }}>
            Account Role
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem', backgroundColor: theme.bgSubtle, padding: '0.3rem', borderRadius: '6px', border: `1px solid ${theme.borderLight}` }}>
            <button
              type="button"
              onClick={() => handleRoleSwitch('Administrator')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                padding: '0.55rem 0.35rem',
                borderRadius: '4px',
                border: role === 'Administrator' ? `1px solid ${theme.borderLight}` : '1px solid transparent',
                backgroundColor: role === 'Administrator' ? theme.bgCard : 'transparent',
                color: role === 'Administrator' ? theme.textMain : theme.textMuted,
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: `1.5px solid ${role === 'Administrator' ? theme.accentGold : theme.borderLight}`, backgroundColor: role === 'Administrator' ? theme.accentGold : 'transparent' }} />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSwitch('Accountant')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                padding: '0.55rem 0.35rem',
                borderRadius: '4px',
                border: role === 'Accountant' ? `1px solid ${theme.borderLight}` : '1px solid transparent',
                backgroundColor: role === 'Accountant' ? theme.bgCard : 'transparent',
                color: role === 'Accountant' ? theme.textMain : theme.textMuted,
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: `1.5px solid ${role === 'Accountant' ? '#38bdf8' : theme.borderLight}`, backgroundColor: role === 'Accountant' ? '#38bdf8' : 'transparent' }} />
              <span>Accountant</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSwitch('User')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                padding: '0.55rem 0.35rem',
                borderRadius: '4px',
                border: role === 'User' ? `1px solid ${theme.borderLight}` : '1px solid transparent',
                backgroundColor: role === 'User' ? theme.bgCard : 'transparent',
                color: role === 'User' ? theme.textMain : theme.textMuted,
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: `1.5px solid ${role === 'User' ? '#34d399' : theme.borderLight}`, backgroundColor: role === 'User' ? '#34d399' : 'transparent' }} />
              <span>User</span>
            </button>
          </div>
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
                autoComplete="off"
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
                autoComplete="new-password"
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: theme.textMuted, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: theme.accentGold }}
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={handleOpenForgotModal}
              style={{
                background: 'transparent',
                border: 'none',
                color: theme.accentGold,
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'none',
              }}
            >
              Forgot Password?
            </button>
          </div>

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

      {/* Forgot Password Modal */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title={
          forgotStep === 'success' 
            ? 'Password Reset Complete' 
            : forgotStep === 'verify' 
            ? 'Verify OTP & Set Password' 
            : 'Forgot Password'
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {forgotStatus && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.75rem 0.9rem',
                borderRadius: '5px',
                fontSize: '0.8rem',
                backgroundColor: forgotStatus.type === 'error' ? theme.errorBg : theme.successBg,
                border: `1px solid ${forgotStatus.type === 'error' ? theme.error : theme.success}`,
                color: forgotStatus.type === 'error' ? theme.error : theme.success,
              }}
            >
              {forgotStatus.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
              <span>{forgotStatus.text}</span>
            </div>
          )}

          {forgotStep === 'request' && (
            <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <p style={{ fontSize: '0.84rem', color: theme.textMuted, margin: 0, lineHeight: 1.5 }}>
                Enter your registered <strong>Login ID</strong> or <strong>Email Address</strong>. We will send a secure 6-digit one-time verification code (OTP) via our SMTP email server.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: theme.textMain }}>Login ID or E-mail *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '0.85rem', color: theme.textDim }} />
                  <input
                    type="text"
                    placeholder="e.g. krish or user@example.com"
                    value={forgotLoginOrEmail}
                    onChange={(e) => setForgotLoginOrEmail(e.target.value)}
                    required
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '0.78rem 1rem 0.78rem 2.45rem',
                      fontSize: '0.88rem',
                      backgroundColor: theme.bgInput,
                      color: theme.textMain,
                      border: `1px solid ${theme.borderLight}`,
                      borderRadius: '5px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ padding: '0.7rem 0.85rem', backgroundColor: theme.bgSubtle, borderRadius: '6px', border: `1px solid ${theme.borderLight}`, display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <ShieldCheck size={16} style={{ color: theme.accentGold, flexShrink: 0 }} />
                <span style={{ fontSize: '0.75rem', color: theme.textMuted }}>
                  Secured by FurniLedger SMTP Mail Relay (<code>furniledger@gmail.com</code>).
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  style={{
                    padding: '0.6rem 1rem',
                    borderRadius: '5px',
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
                  disabled={forgotLoading}
                  style={{
                    padding: '0.6rem 1.3rem',
                    borderRadius: '5px',
                    border: 'none',
                    backgroundColor: theme.accentGold,
                    color: '#0E0D0C',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: forgotLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}
                >
                  {forgotLoading ? (
                    <>
                      <RefreshCw size={14} className="spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {forgotStep === 'verify' && (
            <form onSubmit={handleVerifyAndReset} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div style={{ padding: '0.75rem 0.9rem', backgroundColor: theme.bgSubtle, borderRadius: '6px', border: `1px solid ${theme.borderLight}` }}>
                <p style={{ fontSize: '0.82rem', color: theme.textMuted, margin: 0 }}>
                  Enter the 6-digit OTP code sent to <strong style={{ color: theme.accentGold }}>{maskedEmail}</strong>.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: theme.textMain }}>6-Digit OTP Code *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <KeyRound size={15} style={{ position: 'absolute', left: '0.85rem', color: theme.accentGold }} />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '0.78rem 1rem 0.78rem 2.45rem',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      letterSpacing: '0.3em',
                      fontFamily: 'monospace',
                      backgroundColor: theme.bgInput,
                      color: theme.accentGold,
                      border: `1px solid ${theme.borderLight}`,
                      borderRadius: '5px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: theme.textMain }}>New Password *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '0.85rem', color: theme.textDim }} />
                  <input
                    type={showForgotNewPassword ? 'text' : 'password'}
                    placeholder="Enter new password (min. 6 characters)"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.78rem 2.5rem 0.78rem 2.45rem',
                      fontSize: '0.88rem',
                      backgroundColor: theme.bgInput,
                      color: theme.textMain,
                      border: `1px solid ${theme.borderLight}`,
                      borderRadius: '5px',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                    style={{ position: 'absolute', right: '0.75rem', background: 'transparent', border: 'none', color: theme.textDim, cursor: 'pointer' }}
                  >
                    {showForgotNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: theme.textMain }}>Confirm New Password *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '0.85rem', color: theme.textDim }} />
                  <input
                    type={showForgotNewPassword ? 'text' : 'password'}
                    placeholder="Re-type new password"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.78rem 1rem 0.78rem 2.45rem',
                      fontSize: '0.88rem',
                      backgroundColor: theme.bgInput,
                      color: theme.textMain,
                      border: `1px solid ${theme.borderLight}`,
                      borderRadius: '5px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setForgotStep('request')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: theme.textMuted,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  ← Change Email / ID
                </button>

                {resendTimer > 0 ? (
                  <span style={{ fontSize: '0.76rem', color: theme.textDim }}>
                    Resend code in {resendTimer}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={forgotLoading}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: theme.accentGold,
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Resend OTP Code
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  style={{
                    padding: '0.6rem 1rem',
                    borderRadius: '5px',
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
                  disabled={forgotLoading}
                  style={{
                    padding: '0.6rem 1.3rem',
                    borderRadius: '5px',
                    border: 'none',
                    backgroundColor: theme.accentGold,
                    color: '#0E0D0C',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: forgotLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {forgotLoading ? 'Updating Password...' : 'Verify OTP & Reset Password'}
                </button>
              </div>
            </form>
          )}

          {forgotStep === 'success' && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', backgroundColor: theme.successBg, color: theme.success, marginBottom: '1rem' }}>
                <CheckCircle2 size={42} />
              </div>
              <h4 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: theme.textMain }}>
                Password Reset Successfully!
              </h4>
              <p style={{ fontSize: '0.84rem', color: theme.textMuted, lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
                Your account password has been securely updated in MySQL database. You can now log in with your new credentials.
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                }}
                style={{
                  padding: '0.7rem 1.8rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: theme.accentGold,
                  color: '#0E0D0C',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Proceed to Sign In
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
