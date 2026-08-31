import React from 'react';

interface LiquidCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const LiquidCard: React.FC<LiquidCardProps> = ({
  children,
  className = '',
  glowColor,
  onClick,
  hoverEffect = false,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        boxShadow: glowColor
          ? `0 12px 36px -8px ${glowColor}, inset 0 1px 1px 0 rgba(255, 255, 255, 0.28)`
          : undefined,
      }}
      className={`
        relative overflow-hidden rounded-2xl
        bg-slate-900/60 backdrop-blur-2xl
        border border-white/10
        shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.25)]
        transition-all duration-300 ease-out
        ${hoverEffect ? 'hover:bg-slate-800/70 hover:border-white/20 hover:scale-[1.01] cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Specular Ambient Glow */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
