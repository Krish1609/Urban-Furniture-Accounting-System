export default function Logo({ theme, isSmall = false }) {
  const gold = theme.accentGold;
  const text = theme.textMain;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
      <div 
        style={{ 
          width: isSmall ? '34px' : '48px', 
          height: isSmall ? '34px' : '48px', 
          display: 'grid',
          placeItems: 'center'
        }}
      >
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
          <rect x="2" y="2" width="60" height="60" rx="12" stroke={theme.borderLight} strokeWidth="1.5" fill={theme.bgSubtle} />
          <path d="M20 22C20 18.6863 22.6863 16 26 16H38C41.3137 16 44 18.6863 44 22V36H20V22Z" stroke={gold} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M17 36H47C48.6569 36 50 37.3431 50 39C50 40.6569 48.6569 42 47 42H17C15.3431 42 14 40.6569 14 39C14 37.3431 15.3431 36 17 36Z" fill={gold} opacity="0.2" stroke={gold} strokeWidth="2" />
          <path d="M20 42L17 50M44 42L47 50" stroke={gold} strokeWidth="2.2" strokeLinecap="round" />
          <line x1="26" y1="23" x2="38" y2="23" stroke={gold} strokeWidth="1.8" strokeLinecap="round" />
          <line x1="26" y1="28" x2="38" y2="28" stroke={gold} strokeWidth="1.8" strokeLinecap="round" />
          <line x1="26" y1="33" x2="34" y2="33" stroke={gold} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>

      <div>
        <span style={{ fontFamily: "'Lora', Georgia, serif", fontSize: isSmall ? '1.15rem' : '1.45rem', fontWeight: 600, letterSpacing: '-0.02em', color: text, display: 'block', lineHeight: 1.1 }}>
          FurniLedger
        </span>
        <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: gold, display: 'block' }}>
          Accounting System
        </span>
      </div>
    </div>
  );
}
