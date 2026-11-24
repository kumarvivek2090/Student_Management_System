import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ title = 'No data available', description = 'There are no items to display right now.', icon: Icon = Inbox, action }) => {
  return (
    <div className="text-center py-12 px-4 flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-full bg-cream border border-warmgrey flex items-center justify-center text-muted mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-charcoal">{title}</h4>
      <p className="text-xs text-muted max-w-sm mt-1">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
