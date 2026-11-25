import React from 'react';

const Badge = ({ variant = 'default', children, className = '' }) => {
  const variants = {
    default: 'bg-cream dark:bg-[#1C261A] text-charcoal dark:text-[#E8EDE4] border-warmgrey dark:border-[#2D3C27]',
    olive: 'bg-olive-100 dark:bg-[#23311E] text-olive-800 dark:text-[#BCE39C] border-olive-200 dark:border-[#384E30]',
    sage: 'bg-sage-light dark:bg-[#1E2B1A] text-olive-900 dark:text-[#C5E8A8] border-sage dark:border-[#33462B]',
    success: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    warning: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    danger: 'bg-red-50 dark:bg-rose-950/60 text-red-800 dark:text-rose-300 border-red-200 dark:border-rose-800/60',
    gold: 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border-gold dark:border-amber-700/60',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
        variants[variant] || variants.default
      } ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
