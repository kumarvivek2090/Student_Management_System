import React from 'react';

const ChartCard = ({ title, subtitle, action, children }) => {
  return (
    <div className="card-premium p-6">
      <div className="flex items-center justify-between pb-4 border-b border-warmgrey/60">
        <div>
          <h3 className="text-sm font-semibold text-charcoal">{title}</h3>
          {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="pt-4">{children}</div>
    </div>
  );
};

export default ChartCard;
