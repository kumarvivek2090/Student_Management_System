import React from 'react';

const ChartCard = ({ title, subtitle, action, children }) => {
  return (
    <div className="card-premium p-6">
      <div className="flex items-center justify-between pb-4 border-b border-warmgrey/60 dark:border-[#273422]">
        <div>
          <h3 className="text-sm font-semibold text-charcoal dark:text-[#F3F6F0]">{title}</h3>
          {subtitle && <p className="text-xs text-muted dark:text-[#A8B49E] mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="pt-4">{children}</div>
    </div>
  );
};

export default ChartCard;
