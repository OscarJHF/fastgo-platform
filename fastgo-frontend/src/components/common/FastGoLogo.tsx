import React from 'react';

interface FastGoLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  theme?: 'dark' | 'light';
}

export const FastGoLogo: React.FC<FastGoLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  theme = 'light',
}) => {
  const sizeMap = {
    sm: { height: 28, iconSize: 24, fontSize: 'text-lg' },
    md: { height: 36, iconSize: 32, fontSize: 'text-2xl' },
    lg: { height: 48, iconSize: 42, fontSize: 'text-3xl' },
    xl: { height: 64, iconSize: 56, fontSize: 'text-4xl' },
  };

  const { iconSize, fontSize } = sizeMap[size];
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Isotipo Alado FastGo */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Fondo redondeado con gradiente esmeralda suave */}
        <rect width="48" height="48" rx="12" fill="url(#fastgo-grad)" />
        
        {/* Alas de velocidad izquierda */}
        <path
          d="M10 18C13 18 16 20 18 22H11C9.89543 22 9 21.1046 9 20V19C9 18.4477 9.44772 18 10 18Z"
          fill="white"
          opacity="0.85"
        />
        <path
          d="M12 25C15 25 18 26.5 20 28H14C12.8954 28 12 27.1046 12 26V25.5C12 25.2239 12.2239 25 12.5 25H12Z"
          fill="white"
          opacity="0.7"
        />
        
        {/* Letra F estilizada aerodinámica */}
        <path
          d="M21 14H37C37.5523 14 38 14.4477 38 15V18C38 18.5523 37.5523 19 37 19H27V23H34C34.5523 23 35 23.4477 35 24V27C35 27.5523 34.5523 28 34 28H27V36C27 36.5523 26.5523 37 26 37H22C21.4477 37 21 36.5523 21 36V14Z"
          fill="white"
        />
        
        {/* Línea de velocidad inferior */}
        <circle cx="15" cy="33" r="2" fill="white" opacity="0.6" />

        <defs>
          <linearGradient id="fastgo-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#10B981" />
            <stop offset="1" stopColor="#047857" />
          </linearGradient>
        </defs>
      </svg>

      {/* Logotipo Tipográfico */}
      {variant === 'full' && (
        <span className={`font-black tracking-tight ${fontSize} ${textColor} flex items-center`}>
          FAST
          <span className="text-emerald-600 font-extrabold ml-0.5">GO</span>
        </span>
      )}
    </div>
  );
};
