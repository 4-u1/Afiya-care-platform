import React from 'react';

export interface AafiyaCareLogoProps {
  variant?: 'full' | 'horizontal' | 'icon-only' | 'badge' | 'stamp';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  theme?: 'dark-bg' | 'light-bg' | 'auto';
  showSubtext?: boolean;
  subtext?: string;
  className?: string;
  isAr?: boolean;
  id?: string;
}

export const AafiyaCareLogo: React.FC<AafiyaCareLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  theme = 'auto',
  showSubtext = false,
  subtext,
  className = '',
  isAr = true,
  id = 'aafiyacare-logo',
}) => {
  // Dimension mappings for the emblem
  const iconDimensions = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    '2xl': 'w-28 h-28',
  }[size];

  // Typography size mappings
  const arabicTextSize = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-3xl',
  }[size];

  const englishTextSize = {
    xs: 'text-[9px]',
    sm: 'text-[11px]',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
    '2xl': 'text-lg',
  }[size];

  // Pure SVG Emblem Icon representing the official AafiyaCare folded 'A' ribbon,
  // emerald-cyan orbital swoosh, and central teal heart with white ECG pulse
  const EmblemSVG = ({ className: emblemClass = '' }: { className?: string }) => (
    <svg
      viewBox="0 0 512 512"
      className={`${iconDimensions} ${emblemClass} shrink-0 select-none`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="AafiyaCare Emblem"
    >
      <defs>
        <linearGradient id={`gradBlue-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="35%" stopColor="#2563EB" />
          <stop offset="70%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#0B3A7B" />
        </linearGradient>

        <linearGradient id={`gradSwoosh-${id}`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="35%" stopColor="#10B981" />
          <stop offset="75%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>

        <linearGradient id={`gradHeart-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="45%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        <filter id={`shadow-${id}`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0F3B82" floodOpacity="0.22" />
        </filter>
      </defs>

      <g filter={`url(#shadow-${id})`}>
        {/* Rear Orbit Swoosh (behind the right leg) */}
        <path
          d="M 328 185 C 382 160, 420 145, 442 145 C 448 145, 436 162, 398 192 C 372 212, 348 226, 322 236 Z"
          fill={`url(#gradSwoosh-${id})`}
          opacity="0.95"
        />

        {/* Main 'A' Ribbon - Left Leg arching to Apex */}
        <path
          d="M 132 342 
             C 144 295, 175 198, 222 118 
             C 240 86, 258 72, 276 80 
             C 296 88, 306 112, 316 142 
             L 282 154 
             C 272 125, 260 110, 252 110 
             C 224 110, 194 200, 172 316 
             C 158 328, 140 338, 132 342 Z"
          fill={`url(#gradBlue-${id})`}
        />

        {/* Main 'A' Ribbon - Right Leg descending with depth */}
        <path
          d="M 276 80 
             C 306 95, 346 160, 386 245 
             C 406 286, 416 316, 424 336 
             C 410 340, 384 332, 366 310 
             C 346 268, 316 190, 288 142 
             Z"
          fill={`url(#gradBlue-${id})`}
        />

        {/* Bottom corner fold shadows */}
        <path
          d="M 132 342 C 144 354, 170 350, 186 336 C 194 328, 208 320, 226 330 C 206 346, 176 356, 132 342 Z"
          fill="#08234D"
          opacity="0.85"
        />
        <path
          d="M 424 336 C 410 352, 376 354, 350 332 C 364 320, 382 322, 424 336 Z"
          fill="#08234D"
          opacity="0.8"
        />

        {/* Front Orbiting Emerald Swoosh */}
        <path
          d="M 106 270 
             C 144 240, 210 220, 282 205 
             C 352 190, 412 165, 442 145 
             C 422 164, 362 194, 292 216 
             C 220 238, 148 262, 108 288 
             C 102 282, 104 274, 106 270 Z"
          fill={`url(#gradSwoosh-${id})`}
        />

        {/* Central Emerald Teal Heart */}
        <g transform="translate(256, 276) scale(1.18)">
          <path
            d="M 0 35 
               C -4 -2, -45 -18, -45 -48 
               C -45 -66, -30 -78, -12 -78 
               C 0 -78, 0 -65, 0 -60 
               C 0 -65, 0 -78, 12 -78 
               C 30 -78, 45 -66, 45 -48 
               C 45 -18, 4 -2, 0 35 Z"
            fill={`url(#gradHeart-${id})`}
          />

          {/* White High-Contrast Cardiac Pulse ECG Line */}
          <path
            d="M -30 -48 L -14 -48 L -9 -58 L -3 -32 L 4 -68 L 10 -40 L 16 -50 L 30 -50"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
    </svg>
  );

  // Determine text coloring based on theme
  const isDarkBg = theme === 'dark-bg';
  const primaryTextColor = isDarkBg ? 'text-white' : 'text-[#0C3B7C]';
  const aafiyaTextColor = isDarkBg ? 'text-white' : 'text-[#0C3B7C]';
  const careTextColor = 'text-[#059669]';
  const subtextColor = isDarkBg ? 'text-slate-400' : 'text-slate-500';

  // Variant: ICON ONLY
  if (variant === 'icon-only') {
    return (
      <div id={id} className={`inline-flex items-center justify-center ${className}`}>
        <EmblemSVG />
      </div>
    );
  }

  // Variant: BADGE (e.g. For official reports, clinical sign-offs, passport headers)
  if (variant === 'badge') {
    return (
      <div
        id={id}
        className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-sm bg-white border border-slate-200 shadow-xs ${className}`}
      >
        <EmblemSVG className="w-7 h-7" />
        <div className="flex flex-col text-start">
          <span className="text-xs font-black text-[#0C3B7C] tracking-tight leading-tight">
            عافية كير
          </span>
          <span className="text-[10px] font-extrabold tracking-wider leading-none">
            <span className="text-[#0C3B7C]">Aafiya</span>
            <span className="text-[#059669]">Care</span>
          </span>
        </div>
      </div>
    );
  }

  // Variant: STAMP (Official Verified Regulatory Seal)
  if (variant === 'stamp') {
    return (
      <div
        id={id}
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-blue-50/80 border border-blue-200/80 ${className}`}
      >
        <EmblemSVG className="w-5 h-5" />
        <div className="flex items-center gap-1.5 text-[11px] font-bold">
          <span className="text-[#0C3B7C]">عافية كير</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600 font-mono text-[10px]">VERIFIED</span>
        </div>
      </div>
    );
  }

  // Variant: FULL (Stacked emblem with Arabic & English text centered underneath)
  if (variant === 'full') {
    return (
      <div id={id} className={`flex flex-col items-center text-center ${className}`}>
        <EmblemSVG className="mb-2" />
        <div className="flex flex-col items-center">
          <span className={`font-black ${arabicTextSize} ${primaryTextColor} tracking-wide leading-tight`}>
            عافية كير
          </span>
          <span className={`font-extrabold ${englishTextSize} tracking-tight leading-tight mt-0.5`}>
            <span className={aafiyaTextColor}>Aafiya</span>
            <span className={careTextColor}>Care</span>
          </span>
          {showSubtext && (
            <span className={`text-[10px] uppercase tracking-wider ${subtextColor} mt-1`}>
              {subtext || (isAr ? 'منصة الذكاء الدوائي المبكر' : 'Medication Risk Intelligence')}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default Variant: HORIZONTAL (Emblem on left/right + Arabic & English typography side-by-side)
  return (
    <div id={id} className={`inline-flex items-center gap-3 ${className}`}>
      <EmblemSVG />
      <div className="flex flex-col text-start">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black ${arabicTextSize} ${primaryTextColor} tracking-tight`}>
            عافية كير
          </span>
          <span className="text-slate-400 font-normal text-xs">|</span>
          <span className={`font-black ${englishTextSize} tracking-tight`}>
            <span className={aafiyaTextColor}>Aafiya</span>
            <span className={careTextColor}>Care</span>
          </span>
        </div>
        {showSubtext ? (
          <span className={`text-[10px] uppercase tracking-wider ${subtextColor} mt-1 leading-tight hidden sm:block`}>
            {subtext || (isAr ? 'الذكاء الدوائي الاستباقي • الرعاية المغلقة' : 'Medication Intelligence')}
          </span>
        ) : (
          <span className={`text-[9px] uppercase tracking-widest ${subtextColor} mt-0.5 leading-tight font-medium hidden sm:block`}>
            {isAr ? 'الرعاية الصيدلانية الذكية' : 'Clinical Health Intelligence'}
          </span>
        )}
      </div>
    </div>
  );
};
