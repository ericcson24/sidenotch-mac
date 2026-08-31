import React from 'react';

export const NotchFillets: React.FC = () => {
  return (
    <>
      {/* Top Concave Bézier Fillet Anchor (CodeBurn Style) */}
      <svg
        className="absolute -top-5 right-0 w-5 h-5 pointer-events-none text-[#050508]"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M20 20 C 20 8.954 11.046 0 0 0 L 20 0 Z" />
      </svg>

      {/* Bottom Concave Bézier Fillet Anchor (CodeBurn Style) */}
      <svg
        className="absolute -bottom-5 right-0 w-5 h-5 pointer-events-none text-[#050508]"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M20 0 C 20 11.046 11.046 20 0 20 L 20 20 Z" />
      </svg>
    </>
  );
};
