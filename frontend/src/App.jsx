import { useState, useMemo } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sun, 
  Moon, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Check
} from 'lucide-react';

// ==========================================
// 1. BESPOKE FURNILEGGER VECTOR LOGO COMPONENT
// ==========================================
function FurniLeggerLogo({ theme, isSmall = false }) {
  const gold = theme.accentGold;
  const text = theme.textMain;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
      <div 
        style={{ 
          width: isSmall ? '42px' : '54px', 
          height: isSmall ? '42px' : '54px', 
          display: 'grid',
          placeItems: 'center'
        }}
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%' }}
        >
          <rect
            x="2"
            y="2"
            width="60"
            height="60"
            rx="12"
            stroke={theme.borderLight}
            strokeWidth="1.5"
            fill={theme.bgSubtle}
          />
          {/* Modern Minimalist Chair + Accounting Ledger Balance */}
          <path
            d="M20 22C20 18.6863 22.6863 16 26 16H38C41.3137 16 44 18.6863 44 22V36H20V22Z"
            stroke={gold}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M17 36H47C48.6569 36 50 37.3431 50 39C50 40.6569 48.6569 42 47 42H17C15.3431 42 14 40.6569 14 39C14 37.3431 15.3431 36 17 36Z"
            fill={gold}
            opacity="0.2"
            stroke={gold}
            strokeWidth="2"
          />
          <path
            d="M20 42L17 50M44 42L47 50"
            stroke={gold}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Ledger Accounting Lines */}
          <line x1="26" y1="23" x2="38" y2="23" stroke={gold} strokeWidth="1.8" strokeLinecap="round" />
          <line x1="26" y1="28" x2="38" y2="28" stroke={gold} strokeWidth="1.8" strokeLinecap="round" />
          <line x1="26" y1="33" x2="34" y2="33" stroke={gold} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>

      <div style={{ textAlign: 'center' }}>
        <span 
          style={{ 
            fontFamily: "'Lora', Georgia, serif", 
            fontSize: isSmall ? '1.2rem' : '1.45rem', 
            fontWeight: 600, 
            letterSpacing: '-0.02em',
            color: text,
            display: 'block'
          }}
        >
          FurniLegger
        </span>
        <span 
          style={{ 
            fontSize: '0.65rem', 
            fontWeight: 700, 
            letterSpacing: '0.18em', 
            textTransform: 'uppercase', 
            color: gold,
            display: 'block',
            marginTop: '0.1rem'
          }}
        >
          Accounting System
        </span>
      </div>
    </div>
  );
}

// ==========================================
// 2. THEME COLOR DEFINITIONS
// ==========================================
const THEMES = {
  dark: {
    bgApp: '#0E0D0C',
    bgCard: '#161513',
    bgSubtle: '#1F1D1A',
    bgInput: '#121110',
    textMain: '#F5F2EB',
    textMuted: '#ABA59C',
    textDim: '#706B64',
    borderLight: '#2C2925',
    borderFocus: '#D1B492',
    accentGold: '#CBB08F',
    accentGoldHover: '#DEC4A6',
    accentGoldSoft: '#24201A',
    success: '#81C784',
    successBg: '#132415',
    error: '#E57373',
    errorBg: '#2B1414',
    shadow: '0 20px 60px rgba(0, 0, 0, 0.55)',
  },
  light: {
    bgApp: '#F8F6F2',
    bgCard: '#FFFFFF',
    bgSubtle: '#F4F0E9',
    bgInput: '#FCFBFA',
    textMain: '#181715',
    textMuted: '#6E6B66',
    textDim: '#99948D',
    borderLight: '#E5DFD5',
    borderFocus: '#BFA07C',
    accentGold: '#BFA07C',
    accentGoldHover: '#AB8C67',
    accentGoldSoft: '#F6F1EA',
    success: '#2E7D32',
    successBg: '#EDF7ED',
    error: '#D32F2F',
    errorBg: '#FDEDED',
    shadow: '0 16px 44px rgba(0, 0, 0, 0.07)',
  }
};

export default function App() {
  const [themeMode, setThemeMode] = useState('dark');
  
  // DEFAULT ACTIVE VIEW IS NOW 'create' AS REQUESTED
  const [activeView, setActiveView] = useState('create'); // 'create' | 'login'

  // ==========================================
  // CREATE USER FORM STATE
  // ==========================================
  const [name, setName] = useState('');
  const [loginId, setLoginId] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('User'); // 'User' | 'Administrator'
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ==========================================
  // LOGIN FORM STATE
  // ==========================================
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState('User'); // 'User' | 'Administrator'
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // UI States
  const [focusedField, setFocusedField] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [themeBtnHovered, setThemeBtnHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  const t = THEMES[themeMode];

  // ==========================================
  // VALIDATION RULES FOR CREATE USER
  // ==========================================
  // Rule 1: Login ID between 6-12 characters
  const isLoginIdValid = loginId.trim().length >= 6 && loginId.trim().length <= 12;

  // Rule 2: Email format
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // Rule 3: Password >8 chars, uppercase, lowercase, special char
  const hasMinLength = password.length > 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = hasMinLength && hasLower && hasUpper && hasSpecial;

  // Rule 4: Re-Enter password matches
  const isPasswordMatch = password.length > 0 && password === confirmPassword;

  // Handle Create User Submit
  const handleCreateUserSubmit = (e) => {
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
      setStatusMessage({ type: 'error', text: 'Password must be >8 characters with lowercase, uppercase, and special character.' });
      return;
    }
    if (!isPasswordMatch) {
      setStatusMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Pre-fill login details and navigate to Login Page
      setLoginIdentifier(loginId);
      setLoginPassword(password);
      setLoginRole(role);
      setStatusMessage({ 
        type: 'success', 
        text: `Account created for ${name}! Please sign in to continue.` 
      });
      setActiveView('login');
    }, 750);
  };

  // Reset Create User Form
  const handleCancelCreate = () => {
    setName('');
    setLoginId('');
    setEmail('');
    setRole('User');
    setPassword('');
    setConfirmPassword('');
    setStatusMessage(null);
    setActiveView('login');
  };

  // Handle Login Submit
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter your Login ID / Email and Password.' });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStatusMessage({ 
        type: 'success', 
        text: `Welcome back! Logged in as ${loginRole}.` 
      });
    }, 700);
  };

  // Styles Dictionary
  const styles = useMemo(() => ({
    page: {
      minHeight: '100vh',
      backgroundColor: t.bgApp,
      color: t.textMain,
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2.5rem 1.25rem',
      position: 'relative',
      boxSizing: 'border-box',
      transition: 'background-color 200ms ease, color 200ms ease',
    },
    topBar: {
      position: 'absolute',
      top: '1.5rem',
      right: '2rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.85rem',
    },
    switchViewLink: {
      background: 'transparent',
      border: `1px solid ${t.borderLight}`,
      color: t.textMain,
      padding: '0.45rem 0.85rem',
      borderRadius: '4px',
      fontSize: '0.78rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 150ms ease',
    },
    themeBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.45rem',
      padding: '0.45rem 0.85rem',
      border: `1px solid ${themeBtnHovered ? t.borderFocus : t.borderLight}`,
      backgroundColor: t.bgCard,
      color: themeBtnHovered ? t.textMain : t.textMuted,
      fontSize: '0.78rem',
      fontWeight: 500,
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'all 150ms ease',
    },
    card: {
      width: '100%',
      maxWidth: '450px',
      backgroundColor: t.bgCard,
      border: `1px solid ${t.borderLight}`,
      borderRadius: '10px',
      padding: '2.4rem 2.2rem',
      boxShadow: t.shadow,
      boxSizing: 'border-box',
    },
    logoWrapper: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '1.6rem',
    },
    titleSection: {
      textAlign: 'center',
      marginBottom: '1.5rem',
    },
    heading: {
      fontFamily: "'Lora', Georgia, serif",
      fontSize: '1.65rem',
      fontWeight: 500,
      letterSpacing: '-0.01em',
      color: t.textMain,
      marginBottom: '0.25rem',
    },
    subheading: {
      fontSize: '0.84rem',
      color: t.textMuted,
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.05rem',
    },
    fieldRow: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.3rem',
    },
    labelRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    label: {
      fontSize: '0.8rem',
      fontWeight: 600,
      color: t.textMain,
    },
    forgotLink: {
      background: 'transparent',
      border: 'none',
      fontSize: '0.74rem',
      color: t.accentGold,
      cursor: 'pointer',
      fontWeight: 500,
    },
    inputWrap: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    inputIcon: {
      position: 'absolute',
      left: '0.85rem',
      color: t.textDim,
      pointerEvents: 'none',
    },
    textInput: (isFocused) => ({
      width: '100%',
      padding: '0.75rem 1rem 0.75rem 2.45rem',
      fontSize: '0.88rem',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      backgroundColor: t.bgInput,
      color: t.textMain,
      border: `1px solid ${isFocused ? t.borderFocus : t.borderLight}`,
      borderRadius: '5px',
      outline: 'none',
      boxSizing: 'border-box',
      boxShadow: isFocused ? `0 0 0 3px ${t.accentGoldSoft}` : 'none',
      transition: 'border-color 150ms ease, box-shadow 150ms ease',
    }),
    pwToggleBtn: {
      position: 'absolute',
      right: '0.75rem',
      background: 'transparent',
      border: 'none',
      color: t.textDim,
      cursor: 'pointer',
      display: 'grid',
      placeItems: 'center',
      padding: '0.2rem',
    },
    // Role Radio Selector (User vs Administrator)
    roleContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.45rem',
      marginTop: '0.2rem',
    },
    roleRadioRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.5rem',
      backgroundColor: t.bgSubtle,
      padding: '0.3rem',
      borderRadius: '6px',
      border: `1px solid ${t.borderLight}`,
    },
    roleOptionBtn: (isSelected) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.45rem',
      padding: '0.55rem 0.6rem',
      borderRadius: '4px',
      border: isSelected ? `1px solid ${t.borderLight}` : '1px solid transparent',
      backgroundColor: isSelected ? t.bgCard : 'transparent',
      color: isSelected ? t.textMain : t.textMuted,
      fontSize: '0.82rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 140ms ease',
    }),
    radioDot: (isSelected) => ({
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      border: `1.5px solid ${isSelected ? t.accentGold : t.borderLight}`,
      display: 'grid',
      placeItems: 'center',
      backgroundColor: isSelected ? t.accentGold : 'transparent',
    }),
    rememberRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.8rem',
      color: t.textMuted,
      cursor: 'pointer',
      userSelect: 'none',
    },
    btnRow: {
      display: 'flex',
      gap: '0.85rem',
      marginTop: '0.6rem',
    },
    primaryBtn: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '0.85rem 1.4rem',
      backgroundColor: hoveredBtn === 'primary' ? t.accentGoldHover : t.accentGold,
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '5px',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: '0.88rem',
      fontWeight: 600,
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.75 : 1,
      transform: hoveredBtn === 'primary' && !loading ? 'translateY(-1px)' : 'translateY(0)',
      transition: 'all 160ms ease',
    },
    cancelBtn: {
      padding: '0.85rem 1.4rem',
      backgroundColor: 'transparent',
      color: t.textMuted,
      border: `1px solid ${t.borderLight}`,
      borderRadius: '5px',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: '0.88rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 160ms ease',
    },
    alertBanner: (type) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '0.65rem',
      padding: '0.75rem 0.9rem',
      borderRadius: '4px',
      fontSize: '0.8rem',
      marginBottom: '1rem',
      backgroundColor: type === 'error' ? t.errorBg : t.successBg,
      border: `1px solid ${type === 'error' ? t.error : t.success}`,
      color: type === 'error' ? t.error : t.success,
    }),
    footerText: {
      marginTop: '1.5rem',
      textAlign: 'center',
      fontSize: '0.76rem',
      color: t.textDim,
    },
    modalOverlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'grid',
      placeItems: 'center',
      zIndex: 50,
      padding: '1.25rem',
    },
    modalBox: {
      backgroundColor: t.bgCard,
      border: `1px solid ${t.borderLight}`,
      borderRadius: '8px',
      padding: '2rem',
      maxWidth: '380px',
      width: '100%',
      color: t.textMain,
      boxSizing: 'border-box',
    }
  }), [t, focusedField, hoveredBtn, themeBtnHovered, loading]);

  return (
    <div style={styles.page}>
      {/* Global CSS Reset */}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; padding: 0; background-color: ${t.bgApp}; }
        input::placeholder { color: ${t.textDim}; opacity: 0.65; }
      `}</style>

      {/* Top Header Controls */}
      <div style={styles.topBar}>
        <button
          type="button"
          style={styles.switchViewLink}
          onClick={() => {
            setActiveView(activeView === 'create' ? 'login' : 'create');
            setStatusMessage(null);
          }}
        >
          {activeView === 'create' ? 'Already have an account? Sign In' : 'Need an account? Create User'}
        </button>

        <button
          type="button"
          style={styles.themeBtn}
          onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
          onMouseEnter={() => setThemeBtnHovered(true)}
          onMouseLeave={() => setThemeBtnHovered(false)}
        >
          {themeMode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          <span>{themeMode === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
      </div>

      {/* ==========================================
          FIRST PAGE: CREATE USER (AS REQUESTED)
         ========================================== */}
      {activeView === 'create' ? (
        <div style={styles.card}>
          {/* Logo Header */}
          <div style={styles.logoWrapper}>
            <FurniLeggerLogo theme={t} />
          </div>

          <div style={styles.titleSection}>
            <h1 style={styles.heading}>Create User</h1>
            <p style={styles.subheading}>Register a new user account for FurniLegger</p>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div style={styles.alertBanner(statusMessage.type)} role="alert">
              {statusMessage.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form style={styles.form} onSubmit={handleCreateUserSubmit}>
            {/* Name */}
            <div style={styles.fieldRow}>
              <label style={styles.label} htmlFor="create-name">Name</label>
              <div style={styles.inputWrap}>
                <UserIcon size={15} style={styles.inputIcon} />
                <input
                  id="create-name"
                  type="text"
                  style={styles.textInput(focusedField === 'name')}
                  placeholder="Enter full name"
                  value={name}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Login id */}
            <div style={styles.fieldRow}>
              <div style={styles.labelRow}>
                <label style={styles.label} htmlFor="create-loginId">Login id</label>
                <span style={{ fontSize: '0.7rem', color: isLoginIdValid ? t.success : t.textDim }}>
                  6–12 characters
                </span>
              </div>
              <div style={styles.inputWrap}>
                <UserIcon size={15} style={styles.inputIcon} />
                <input
                  id="create-loginId"
                  type="text"
                  style={styles.textInput(focusedField === 'loginId')}
                  placeholder="e.g. john_doe"
                  value={loginId}
                  onFocus={() => setFocusedField('loginId')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setLoginId(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* E-mail id */}
            <div style={styles.fieldRow}>
              <label style={styles.label} htmlFor="create-email">E-mail id</label>
              <div style={styles.inputWrap}>
                <Mail size={15} style={styles.inputIcon} />
                <input
                  id="create-email"
                  type="email"
                  style={styles.textInput(focusedField === 'email')}
                  placeholder="user@urbanfurniture.com"
                  value={email}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Role (User / Administrator) */}
            <div style={styles.roleContainer}>
              <label style={styles.label}>Role</label>
              <div style={styles.roleRadioRow}>
                <button
                  type="button"
                  style={styles.roleOptionBtn(role === 'User')}
                  onClick={() => setRole('User')}
                >
                  <div style={styles.radioDot(role === 'User')} />
                  <span>User</span>
                </button>

                <button
                  type="button"
                  style={styles.roleOptionBtn(role === 'Administrator')}
                  onClick={() => setRole('Administrator')}
                >
                  <div style={styles.radioDot(role === 'Administrator')} />
                  <span>Administrator</span>
                </button>
              </div>
            </div>

            {/* Password */}
            <div style={styles.fieldRow}>
              <div style={styles.labelRow}>
                <label style={styles.label} htmlFor="create-password">Password</label>
                <span style={{ fontSize: '0.7rem', color: isPasswordValid ? t.success : t.textDim }}>
                  &gt; 8 chars, aA@
                </span>
              </div>
              <div style={styles.inputWrap}>
                <Lock size={15} style={styles.inputIcon} />
                <input
                  id="create-password"
                  type={showPassword ? 'text' : 'password'}
                  style={styles.textInput(focusedField === 'password')}
                  placeholder="Uppercase, lowercase & symbol"
                  value={password}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  style={styles.pwToggleBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Re-Enter Password */}
            <div style={styles.fieldRow}>
              <div style={styles.labelRow}>
                <label style={styles.label} htmlFor="create-confirm-password">Re-Enter Password</label>
                {confirmPassword && (
                  <span style={{ fontSize: '0.7rem', color: isPasswordMatch ? t.success : t.error }}>
                    {isPasswordMatch ? 'Match' : 'Mismatch'}
                  </span>
                )}
              </div>
              <div style={styles.inputWrap}>
                <Lock size={15} style={styles.inputIcon} />
                <input
                  id="create-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  style={styles.textInput(focusedField === 'confirmPassword')}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  style={styles.pwToggleBtn}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Action Buttons: Create & Cancel */}
            <div style={styles.btnRow}>
              <button
                type="submit"
                style={styles.primaryBtn}
                disabled={loading}
                onMouseEnter={() => setHoveredBtn('primary')}
                onMouseLeave={() => setHoveredBtn(null)}
              >
                <span>{loading ? 'Creating...' : 'Create'}</span>
                {!loading && <ArrowRight size={15} />}
              </button>

              <button
                type="button"
                style={styles.cancelBtn}
                onClick={handleCancelCreate}
              >
                Cancel
              </button>
            </div>
          </form>

          <p style={styles.footerText}>
            FurniLegger Accounting Suite • Create User Workflow
          </p>
        </div>
      ) : (
        /* ==========================================
            SECOND PAGE: SIGN IN (LOGIN PAGE)
           ========================================== */
        <div style={styles.card}>
          <div style={styles.logoWrapper}>
            <FurniLeggerLogo theme={t} />
          </div>

          <div style={styles.titleSection}>
            <h1 style={styles.heading}>Sign In</h1>
            <p style={styles.subheading}>Access your furniture accounting portal</p>
          </div>

          {/* Role selection on login */}
          <div style={styles.roleContainer}>
            <span style={styles.label}>Account Role</span>
            <div style={styles.roleRadioRow}>
              <button
                type="button"
                style={styles.roleOptionBtn(loginRole === 'Administrator')}
                onClick={() => setLoginRole('Administrator')}
              >
                <div style={styles.radioDot(loginRole === 'Administrator')} />
                <span>Administrator</span>
              </button>

              <button
                type="button"
                style={styles.roleOptionBtn(loginRole === 'User')}
                onClick={() => setLoginRole('User')}
              >
                <div style={styles.radioDot(loginRole === 'User')} />
                <span>User</span>
              </button>
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div style={styles.alertBanner(statusMessage.type)} role="alert">
              {statusMessage.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form style={styles.form} onSubmit={handleLoginSubmit}>
            {/* Login ID / Email */}
            <div style={styles.fieldRow}>
              <label style={styles.label} htmlFor="login-id-field">
                Login ID or E-mail
              </label>
              <div style={styles.inputWrap}>
                <UserIcon size={15} style={styles.inputIcon} />
                <input
                  id="login-id-field"
                  type="text"
                  style={styles.textInput(focusedField === 'loginIdField')}
                  placeholder="Enter login id or email"
                  autoComplete="username"
                  value={loginIdentifier}
                  onFocus={() => setFocusedField('loginIdField')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div style={styles.fieldRow}>
              <div style={styles.labelRow}>
                <label style={styles.label} htmlFor="login-pass-field">
                  Password
                </label>
                <button
                  type="button"
                  style={styles.forgotLink}
                  onClick={() => setForgotModalOpen(true)}
                >
                  Forgot?
                </button>
              </div>
              <div style={styles.inputWrap}>
                <Lock size={15} style={styles.inputIcon} />
                <input
                  id="login-pass-field"
                  type={showLoginPassword ? 'text' : 'password'}
                  style={styles.textInput(focusedField === 'loginPassField')}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  value={loginPassword}
                  onFocus={() => setFocusedField('loginPassField')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  style={styles.pwToggleBtn}
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <label style={styles.rememberRow}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: t.accentGold, cursor: 'pointer' }}
              />
              <span>Remember me on this device</span>
            </label>

            {/* Submit Action */}
            <div style={styles.btnRow}>
              <button
                type="submit"
                style={styles.primaryBtn}
                disabled={loading}
                onMouseEnter={() => setHoveredBtn('primary')}
                onMouseLeave={() => setHoveredBtn(null)}
              >
                <span>{loading ? 'Authenticating...' : `Sign in as ${loginRole}`}</span>
                {!loading && <ArrowRight size={15} />}
              </button>

              <button
                type="button"
                style={styles.cancelBtn}
                onClick={() => setActiveView('create')}
              >
                Create User
              </button>
            </div>
          </form>

          <p style={styles.footerText}>
            FurniLegger Accounting Suite • All rights reserved
          </p>
        </div>
      )}

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setForgotModalOpen(false)}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.25rem', marginBottom: '0.6rem' }}>
              Reset Password
            </h3>
            <p style={{ fontSize: '0.85rem', color: t.textMuted, lineHeight: '1.5', marginBottom: '1.3rem' }}>
              Password recovery requests must be verified by the system Administrator for security compliance.
            </p>
            <button
              type="button"
              style={styles.primaryBtn}
              onClick={() => setForgotModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}