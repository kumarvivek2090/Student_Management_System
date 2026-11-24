import React from 'react';

const StatCard = ({ title, value, change, icon: Icon, trend = 'neutral', subtitle }) => {
  return (
    <div className="card-premium p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-olive-50 border border-olive-100 flex items-center justify-center text-olive-600">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-charcoal">{value}</div>
        {(subtitle || change) && (
          <div className="flex items-center space-x-1.5 mt-1 text-xs">
            {change && (
              <span className={`font-semibold ${
                trend === 'up' ? 'text-olive-600' : trend === 'down' ? 'text-red-600' : 'text-muted'
              }`}>
                {change}
              </span>
            )}
            {subtitle && <span className="text-muted">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
