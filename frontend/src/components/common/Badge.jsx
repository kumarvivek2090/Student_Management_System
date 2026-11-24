import React from 'react';

const Badge = ({ variant = 'default', children, className = '' }) => {
  const variants = {
    default: 'bg-cream text-charcoal border-warmgrey',
    olive: 'bg-olive-100 text-olive-800 border-olive-200',
    sage: 'bg-sage-light text-olive-900 border-sage',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-red-50 text-red-800 border-red-200',
    gold: 'bg-amber-100 text-amber-900 border-gold',
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
