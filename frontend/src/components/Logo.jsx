import { useTheme } from '../context/ThemeContext';

export default function Logo({ theme: propTheme, isSmall = false, showText = true }) {
  let ctxTheme = null;
  let themeMode = 'dark';
  try {
    const ctx = useTheme();
    if (ctx) {
      ctxTheme = ctx.theme;
      themeMode = ctx.themeMode;
    }
  } catch (e) {
    // fallback if outside ThemeProvider
  }

  const theme = propTheme || ctxTheme || {};
  const gold = theme?.accentGold || '#BFA07C';
  const text = theme?.textMain || '#FFFFFF';
  const isLight = themeMode === 'light';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: isSmall ? '0.7rem' : '0.9rem' }}>
      {/* Official Brand Logo Icon Mark from Design.com */}
      <div
        style={{
          width: isSmall ? '42px' : '56px',
          height: isSmall ? '42px' : '56px',
          borderRadius: '10px',
          backgroundColor: '#FAF8F5',
          border: `1.5px solid ${isLight ? '#E2E8F0' : 'rgba(226, 194, 155, 0.35)'}`,
          boxShadow: isSmall
            ? '0 2px 6px rgba(0, 0, 0, 0.08)'
            : '0 4px 16px rgba(0, 0, 0, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '3px',
          flexShrink: 0,
          transition: 'transform 180ms ease, box-shadow 180ms ease',
        }}
      >
        <img
          src="/logo.png"
          alt="FurniLedger Logo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: isSmall ? '1.22rem' : '1.55rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: text,
              display: 'block',
              lineHeight: 1.1,
            }}
          >
            FurniLedger
          </span>
          <span
            style={{
              fontSize: isSmall ? '0.62rem' : '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: gold,
              display: 'block',
              marginTop: '2px',
            }}
          >
            Accounting System
          </span>
        </div>
      )}
    </div>
  );
}
