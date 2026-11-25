import React from 'react';

const StatCard = ({ title, value, change, icon: Icon, trend = 'neutral', subtitle }) => {
  return (
    <div className="card-premium p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted dark:text-[#CAD6B7] uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-olive-50 dark:bg-[#22301D] border border-olive-100 dark:border-[#32452B] flex items-center justify-center text-olive-600 dark:text-[#B2D297]">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-charcoal dark:text-white">{value}</div>
        {(subtitle || change) && (
          <div className="flex items-center space-x-1.5 mt-1 text-xs">
            {change && (
              <span className={`font-semibold ${
                trend === 'up' ? 'text-olive-600 dark:text-emerald-400' : trend === 'down' ? 'text-red-600 dark:text-rose-400' : 'text-muted dark:text-[#CAD6B7]'
              }`}>
                {change}
              </span>
            )}
            {subtitle && <span className="text-muted dark:text-[#A8B49E]">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
