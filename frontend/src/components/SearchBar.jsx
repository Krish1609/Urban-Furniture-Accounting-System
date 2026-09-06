import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  width = '340px',
  style = {}
}) {
  const { theme, themeMode } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: '' } });
    }
  };

  const borderColor = isFocused
    ? theme.accentGold
    : isHovered
    ? (themeMode === 'light' ? '#94A3B8' : '#524B43')
    : (themeMode === 'light' ? '#CBD5E1' : theme.borderLight);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: width,
        maxWidth: '100%',
        backgroundColor: themeMode === 'light' ? '#FFFFFF' : theme.bgInput,
        border: `1.5px solid ${borderColor}`,
        borderRadius: '8px',
        boxShadow: isFocused
          ? `0 0 0 3.5px ${themeMode === 'light' ? 'rgba(191, 160, 124, 0.22)' : 'rgba(226, 194, 155, 0.2)'}, 0 2px 8px rgba(0, 0, 0, 0.06)`
          : '0 1px 3px rgba(0, 0, 0, 0.04)',
        transition: 'all 160ms ease-in-out',
        ...style
      }}
    >
      <Search
        size={15}
        style={{
          position: 'absolute',
          left: '0.85rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: isFocused ? theme.accentGold : theme.textDim,
          pointerEvents: 'none',
          transition: 'color 160ms ease',
        }}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          width: '100%',
          padding: '0.55rem 2.2rem 0.55rem 2.4rem',
          border: 'none',
          backgroundColor: 'transparent',
          color: theme.textMain,
          fontSize: '0.85rem',
          fontWeight: 500,
          outline: 'none',
          letterSpacing: '0.01em'
        }}
      />
      {Boolean(value) && (
        <button
          type="button"
          onClick={handleClear}
          title="Clear search"
          style={{
            position: 'absolute',
            right: '0.65rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: themeMode === 'light' ? '#F1F5F9' : theme.bgSubtle,
            border: `1px solid ${theme.borderLight}`,
            color: theme.textMuted,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
            transition: 'all 120ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme.accentGold;
            e.currentTarget.style.borderColor = theme.accentGold;
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.textMuted;
            e.currentTarget.style.borderColor = theme.borderLight;
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
