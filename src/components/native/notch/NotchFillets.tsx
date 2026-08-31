import React from 'react';

export const NotchFillets: React.FC = () => {
  return (
    <>
      {/* Top Concave Fillet Anchor */}
      <svg
        className="absolute -top-4 right-0 w-4 h-4 pointer-events-none text-[#070709]"
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <path d="M16 16 C 16 7.163 8.837 0 0 0 L 16 0 Z" />
      </svg>

      {/* Bottom Concave Fillet Anchor */}
      <svg
        className="absolute -bottom-4 right-0 w-4 h-4 pointer-events-none text-[#070709]"
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <path d="M16 0 C 16 8.837 8.837 16 0 16 L 16 16 Z" />
      </svg>
    </>
  );
};
