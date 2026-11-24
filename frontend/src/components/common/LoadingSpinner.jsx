import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div
        className={`${sizeMap[size] || sizeMap.md} rounded-full border-olive-200 border-t-olive-600 animate-spin`}
      />
      {message && <p className="text-xs text-muted font-medium">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
