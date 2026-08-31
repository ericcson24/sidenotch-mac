import React from 'react';

interface GaugeRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  glowColor?: string;
  children?: React.ReactNode;
  label?: string;
}

export const GaugeRing: React.FC<GaugeRingProps> = ({
  percentage,
  size = 110,
  strokeWidth = 9,
  color = '#38bdf8',
  glowColor = 'rgba(56, 189, 248, 0.45)',
  children,
  label,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Ring with Glow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            filter: `drop-shadow(0 0 6px ${glowColor})`,
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      </svg>
      {/* Center Label / Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        {children ? (
          children
        ) : (
          <>
            <span className="text-xl font-bold tracking-tight text-white">{percentage.toFixed(0)}%</span>
            {label && <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400">{label}</span>}
          </>
        )}
      </div>
    </div>
  );
};
