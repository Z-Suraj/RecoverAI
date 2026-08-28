import React, { useState, useEffect, useMemo } from 'react';
import { LucideIcon, Package, Sparkles, ShieldCheck, ShoppingBag, CreditCard, Building2 } from 'lucide-react';

export type SafeImageFallbackType =
  | 'initials'
  | 'gradient'
  | 'product'
  | 'context'
  | 'hero'
  | 'icon'
  | 'gateway'
  | 'neutral';

export interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackType?: SafeImageFallbackType;
  fallbackText?: string;
  fallbackIcon?: LucideIcon;
  iconClassName?: string;
  gradientTheme?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate' | 'violet' | 'sky' | 'dark' | 'auto';
}

/**
 * Extracts 1-2 uppercase initials from a name or label
 */
export function getCleanInitials(text?: string, maxChars = 2): string {
  if (!text) return 'RA';
  const clean = text.trim();
  if (!clean) return 'RA';
  const parts = clean.split(/[\s_\-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, maxChars).toUpperCase();
}

/**
 * Deterministic color generator based on text hash for consistent avatar and badge backgrounds
 */
export function getDeterministicGradient(text?: string, theme?: string): string {
  const themedPalettes: Record<string, string> = {
    indigo: 'from-indigo-600 to-indigo-800 text-white',
    emerald: 'from-emerald-600 to-teal-700 text-white',
    amber: 'from-amber-600 to-orange-700 text-white',
    rose: 'from-rose-600 to-pink-700 text-white',
    slate: 'from-slate-700 to-slate-900 text-white',
    violet: 'from-violet-600 to-purple-800 text-white',
    sky: 'from-sky-600 to-cyan-800 text-white',
    dark: 'from-slate-900 via-indigo-950 to-slate-900 text-indigo-200',
    neutral: 'from-slate-100 to-slate-200 text-slate-700',
  };

  if (theme && theme !== 'auto' && themedPalettes[theme]) {
    return themedPalettes[theme];
  }

  const gradients = [
    'from-indigo-600 to-blue-700 text-white',
    'from-emerald-600 to-teal-700 text-white',
    'from-violet-600 to-purple-800 text-white',
    'from-amber-600 to-orange-700 text-white',
    'from-rose-600 to-pink-700 text-white',
    'from-sky-600 to-cyan-800 text-white',
    'from-slate-700 to-slate-900 text-white',
    'from-blue-700 to-indigo-900 text-white',
    'from-teal-600 to-emerald-800 text-white',
  ];

  if (!text) return gradients[0];
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return gradients[Math.abs(hash) % gradients.length];
}

/**
 * SafeImage Component
 * Robust image loader with instant fallback to initials or contextual CSS gradients.
 * Eliminates broken image icons, network 404 flashes, and layout shifts.
 */
export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = '',
  className = '',
  fallbackType = 'gradient',
  fallbackText,
  fallbackIcon: FallbackIcon,
  iconClassName = 'w-4 h-4',
  gradientTheme = 'auto',
  ...rest
}) => {
  const [hasError, setHasError] = useState(!src);
  const [isLoaded, setIsLoaded] = useState(false);

  // Pre-calculate fallback visuals
  const labelForFallback = fallbackText || alt || '';
  const initials = useMemo(() => getCleanInitials(labelForFallback), [labelForFallback]);
  const gradientClass = useMemo(
    () => getDeterministicGradient(labelForFallback, gradientTheme),
    [labelForFallback, gradientTheme]
  );

  useEffect(() => {
    if (!src || src.trim() === '') {
      setHasError(true);
      setIsLoaded(false);
      return;
    }
    setHasError(false);
    setIsLoaded(false);

    // Preload image in background for instant availability and validation
    const img = new Image();
    img.src = src;
    img.referrerPolicy = 'no-referrer';
    img.onload = () => {
      setIsLoaded(true);
      setHasError(false);
    };
    img.onerror = () => {
      setHasError(true);
      setIsLoaded(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  // If source failed or is absent, render contextually rich fallback
  if (hasError || !src) {
    // 1. Clean Initials-Based Avatar Fallback
    if (
      fallbackType === 'initials' ||
      (!FallbackIcon && fallbackText && fallbackType !== 'product' && fallbackType !== 'context' && fallbackType !== 'hero' && fallbackType !== 'gateway')
    ) {
      return (
        <div
          role="img"
          aria-label={alt || labelForFallback || 'Avatar'}
          className={`flex items-center justify-center font-bold tracking-wider select-none bg-linear-to-br ${gradientClass} ${className}`}
        >
          <span className="text-[0.68em] uppercase leading-none font-mono font-extrabold">{initials}</span>
        </div>
      );
    }

    // 2. Product Thumbnail Fallback
    if (fallbackType === 'product') {
      return (
        <div
          role="img"
          aria-label={alt || labelForFallback || 'Product'}
          className={`flex items-center justify-center bg-linear-to-br from-slate-100 to-slate-200/80 border border-slate-200/90 text-slate-500 overflow-hidden ${className}`}
        >
          {FallbackIcon ? (
            <FallbackIcon className={iconClassName} />
          ) : fallbackText ? (
            <div className="flex flex-col items-center justify-center text-center p-1">
              <Package className="w-3.5 h-3.5 text-slate-400 mb-0.5" />
              <span className="text-[0.6em] font-mono font-bold uppercase text-slate-600 leading-tight">
                {getCleanInitials(fallbackText, 3)}
              </span>
            </div>
          ) : (
            <ShoppingBag className="w-1/2 h-1/2 text-slate-400" />
          )}
        </div>
      );
    }

    // 3. Payment Gateway / Brand Fallback
    if (fallbackType === 'gateway') {
      return (
        <div
          role="img"
          aria-label={alt || labelForFallback || 'Gateway'}
          className={`flex items-center justify-center font-mono font-bold tracking-tight bg-linear-to-br from-slate-800 to-slate-950 text-indigo-300 border border-slate-700/80 ${className}`}
        >
          <span className="text-[0.65em] uppercase font-black">{initials}</span>
        </div>
      );
    }

    // 4. Hero / Context Visual Banner Fallback
    if (fallbackType === 'hero' || fallbackType === 'context') {
      return (
        <div
          role="img"
          aria-label={alt || labelForFallback || 'Visual Context'}
          className={`relative overflow-hidden bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 flex items-center justify-center ${className}`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
          <div className="flex flex-col items-center justify-center space-y-2 p-4 text-center z-10">
            {FallbackIcon ? (
              <FallbackIcon className="w-8 h-8 text-indigo-400" />
            ) : (
              <Sparkles className="w-7 h-7 text-indigo-400" />
            )}
            {fallbackText && (
              <span className="text-xs font-bold text-slate-300 tracking-tight">{fallbackText}</span>
            )}
          </div>
        </div>
      );
    }

    // 5. Default Contextual Gradient Fallback (No broken icon!)
    return (
      <div
        role="img"
        aria-label={alt || labelForFallback || 'Image'}
        className={`flex items-center justify-center bg-linear-to-br from-slate-100 to-slate-200 text-slate-500 border border-slate-200/80 ${className}`}
      >
        {FallbackIcon ? (
          <FallbackIcon className={iconClassName} />
        ) : fallbackText ? (
          <span className="text-[0.65em] font-mono font-extrabold uppercase text-slate-600 tracking-wider">
            {initials}
          </span>
        ) : (
          <div className="w-2 h-2 rounded-full bg-slate-300" />
        )}
      </div>
    );
  }

  // Loaded or Loading State
  return (
    <div className={`relative overflow-hidden inline-flex items-center justify-center ${className}`}>
      {/* Skeleton loader background while image is downloading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-200/80 animate-pulse flex items-center justify-center z-0">
          {fallbackText ? (
            <span className="text-[0.65em] font-mono font-bold text-slate-500">{initials}</span>
          ) : (
            <div className="w-3 h-3 rounded-full bg-slate-300/80" />
          )}
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`w-full h-full object-cover transition-opacity duration-200 z-10 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onError={() => setHasError(true)}
        onLoad={() => {
          setIsLoaded(true);
          setHasError(false);
        }}
        referrerPolicy="no-referrer"
        {...rest}
      />
    </div>
  );
};


