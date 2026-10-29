import React from 'react';

/**
 * Concentric Target Emblem (The iconic "O" in CXO)
 * - Outer heavy Charcoal ring (#111315)
 * - Inner Warm Ochre Gold ring (#D99B26)
 * - Center Warm Ochre Gold bullseye dot (#D99B26)
 */
export const ConcentricEmblem = ({ size = 44, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`flex-shrink-0 ${className}`}
  >
    {/* Outer Heavy Ring */}
    <circle
      cx="32"
      cy="32"
      r="25"
      fill="none"
      stroke="#111315"
      strokeWidth="11"
    />
    {/* Inner Ochre Gold Ring */}
    <circle
      cx="32"
      cy="32"
      r="13.5"
      fill="none"
      stroke="#D99B26"
      strokeWidth="3.5"
    />
    {/* Center Ochre Gold Solid Dot */}
    <circle
      cx="32"
      cy="32"
      r="4.8"
      fill="#D99B26"
    />
  </svg>
);

/**
 * Full Brand Logo (Stack matching official geometry)
 *  T H E
 *  C X [O]
 *  N E T W O R K / C O N N E C T
 */
export const BrandLogo = ({
  size = 'md', // 'sm' | 'md' | 'lg'
  variant = 'network', // 'network' | 'connect'
  className = '',
  textColor = '#111315'
}) => {
  const subtitle = variant === 'network' ? 'N E T W O R K' : 'C O N N E C T';

  const scaleMap = {
    sm: { width: 140, height: 70 },
    md: { width: 190, height: 95 },
    lg: { width: 250, height: 125 }
  };

  const { width, height } = scaleMap[size] || scaleMap.md;

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 200 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top: "T H E" */}
        <text
          x="100"
          y="20"
          textAnchor="middle"
          fill={textColor}
          fontSize="11"
          fontWeight="800"
          fontFamily="'Plus Jakarta Sans', Inter, sans-serif"
          letterSpacing="0.45em"
        >
          THE
        </text>

        {/* Center: "C X" text */}
        <text
          x="44"
          y="68"
          fill={textColor}
          fontSize="50"
          fontWeight="900"
          fontFamily="'Plus Jakarta Sans', sans-serif"
          letterSpacing="-0.04em"
        >
          CX
        </text>

        {/* Center: Concentric "O" Emblem */}
        <g transform="translate(142, 50)">
          {/* Outer Heavy Ring */}
          <circle
            cx="0"
            cy="0"
            r="20.5"
            fill="none"
            stroke={textColor}
            strokeWidth="9"
          />
          {/* Inner Ochre Gold Ring */}
          <circle
            cx="0"
            cy="0"
            r="11"
            fill="none"
            stroke="#D99B26"
            strokeWidth="3.2"
          />
          {/* Center Ochre Gold Solid Dot */}
          <circle
            cx="0"
            cy="0"
            r="4"
            fill="#D99B26"
          />
        </g>

        {/* Bottom: "N E T W O R K" */}
        <text
          x="100"
          y="93"
          textAnchor="middle"
          fill={textColor}
          fontSize="12.5"
          fontWeight="900"
          fontFamily="'Plus Jakarta Sans', Inter, sans-serif"
          letterSpacing="0.32em"
        >
          {subtitle}
        </text>
      </svg>
    </div>
  );
};

export default BrandLogo;
