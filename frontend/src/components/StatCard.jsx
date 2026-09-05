import { useTheme } from '../context/ThemeContext';

export default function StatCard({ label, value, subtext, isPositive, color }) {
  const { theme } = useTheme();

  return (
    <div
      style={{
        backgroundColor: theme.bgCard,
        border: `1px solid ${theme.borderLight}`,
        borderRadius: '8px',
        padding: '1.35rem',
        boxShadow: theme.shadow,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
      }}
    >
      <span
        style={{
          fontSize: '0.72rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: theme.textDim,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'Lora', Georgia, serif",
          fontSize: '1.6rem',
          fontWeight: 600,
          color: color || theme.textMain,
        }}
      >
        {value}
      </span>
      {subtext && (
        <span style={{ fontSize: '0.74rem', color: theme.textMuted }}>
          {subtext}
        </span>
      )}
    </div>
  );
}
