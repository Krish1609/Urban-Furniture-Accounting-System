import React, { useState } from 'react';

/**
 * BudgetPieChart - Renders an interactive SVG 2-slice Pie Chart (Achieved vs Balance)
 * matching the user's diagram specification:
 * - Achieved (Cyan / Teal)
 * - Balance (Coral / Red)
 */
export default function BudgetPieChart({
  achieved = 10000,
  committed = 200000,
  balance = null,
  size = 48,
  showLegend = false,
  showTooltip = true,
  onClick = null
}) {
  const [hoveredSlice, setHoveredSlice] = useState(null);

  const numCommitted = Math.max(1, Number(committed) || 1);
  const numAchieved = Math.max(0, Number(achieved) || 0);
  const numBalance = balance !== null ? Number(balance) : Math.max(0, numCommitted - numAchieved);

  const total = numAchieved + numBalance > 0 ? numAchieved + numBalance : numCommitted;
  const achievedRatio = Math.min(1, Math.max(0, numAchieved / total));
  const achievedPercent = Math.round(achievedRatio * 100);
  const balancePercent = Math.max(0, 100 - achievedPercent);

  // SVG dimensions
  const center = size / 2;
  const radius = (size / 2) * 0.85;

  // Helper to convert polar coordinates to Cartesian
  const polarToCartesian = (cx, cy, r, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    };
  };

  // Helper to build SVG arc path
  const describeArc = (cx, cy, r, startAngle, endAngle) => {
    // If arc is full circle (>= 359.99 degrees)
    if (endAngle - startAngle >= 359.9) {
      return `M ${cx} ${cy - r} A ${r} ${r} 0 1 0 ${cx} ${cy + r} A ${r} ${r} 0 1 0 ${cx} ${cy - r} Z`;
    }
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', cx, cy,
      'L', start.x, start.y,
      'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
      'Z'
    ].join(' ');
  };

  const achievedAngle = achievedRatio * 360;

  // Path data
  const achievedPath = describeArc(center, center, radius, 0, achievedAngle);
  const balancePath = describeArc(center, center, radius, achievedAngle, 360);

  const cyanColor = '#06b6d4'; // Achieved (Cyan / Teal)
  const redColor = '#f43f5e';  // Balance (Coral / Red)

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: showLegend ? 'column' : 'row',
        alignItems: 'center',
        gap: '0.6rem',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ overflow: 'visible', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' }}
        >
          {/* Background circle */}
          <circle cx={center} cy={center} r={radius} fill="#1e293b" />

          {/* Achieved Slice (Cyan) */}
          {achievedRatio > 0 && (
            <path
              d={achievedPath}
              fill={cyanColor}
              stroke="#0f172a"
              strokeWidth="1.5"
              style={{
                transition: 'all 0.2s ease',
                opacity: hoveredSlice === 'balance' ? 0.6 : 1,
                transform: hoveredSlice === 'achieved' ? 'scale(1.04)' : 'scale(1)',
                transformOrigin: `${center}px ${center}px`,
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHoveredSlice('achieved')}
              onMouseLeave={() => setHoveredSlice(null)}
            />
          )}

          {/* Balance Slice (Coral / Red) */}
          {achievedRatio < 1 && (
            <path
              d={balancePath}
              fill={redColor}
              stroke="#0f172a"
              strokeWidth="1.5"
              style={{
                transition: 'all 0.2s ease',
                opacity: hoveredSlice === 'achieved' ? 0.6 : 1,
                transform: hoveredSlice === 'balance' ? 'scale(1.04)' : 'scale(1)',
                transformOrigin: `${center}px ${center}px`,
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHoveredSlice('balance')}
              onMouseLeave={() => setHoveredSlice(null)}
            />
          )}
        </svg>

        {/* Hover Tooltip Popup */}
        {showTooltip && hoveredSlice && (
          <div
            style={{
              position: 'absolute',
              bottom: '105%',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#0f172a',
              color: '#f8fafc',
              border: `1px solid ${hoveredSlice === 'achieved' ? cyanColor : redColor}`,
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              fontSize: '0.72rem',
              whiteSpace: 'nowrap',
              zIndex: 999,
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              pointerEvents: 'none',
              fontWeight: 600,
            }}
          >
            {hoveredSlice === 'achieved' ? (
              <span style={{ color: cyanColor }}>
                Achieved: ₹{numAchieved.toLocaleString()} ({achievedPercent}%)
              </span>
            ) : (
              <span style={{ color: redColor }}>
                Balance: ₹{numBalance.toLocaleString()} ({balancePercent}%)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Optional Legend below or beside chart */}
      {showLegend && (
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.76rem', marginTop: '0.3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: cyanColor, display: 'inline-block' }}></span>
            <span>Achieved ({achievedPercent}%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: redColor, display: 'inline-block' }}></span>
            <span>Balance ({balancePercent}%)</span>
          </div>
        </div>
      )}
    </div>
  );
}
