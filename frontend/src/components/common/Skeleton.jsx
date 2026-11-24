import React from 'react';

export const SkeletonBox = ({ className = '' }) => (
  <div className={`animate-pulse bg-cream/70 rounded-lg ${className}`} />
);

export const SkeletonStatCard = () => (
  <div className="card-premium p-5 flex items-center justify-between">
    <div className="space-y-2.5 flex-1 pr-4">
      <SkeletonBox className="h-3 w-20" />
      <SkeletonBox className="h-7 w-28" />
      <SkeletonBox className="h-2.5 w-16" />
    </div>
    <SkeletonBox className="w-12 h-12 rounded-xl" />
  </div>
);

export const SkeletonChart = ({ height = 'h-72' }) => (
  <div className="card-premium p-6 space-y-4">
    <div className="flex items-center justify-between pb-3 border-b border-warmgrey/60">
      <div className="space-y-2">
        <SkeletonBox className="h-4 w-36" />
        <SkeletonBox className="h-3 w-48" />
      </div>
      <SkeletonBox className="h-8 w-24 rounded-lg" />
    </div>
    <div className={`${height} w-full flex items-end justify-between gap-3 pt-6 px-4`}>
      <SkeletonBox className="h-2/3 flex-1" />
      <SkeletonBox className="h-4/5 flex-1" />
      <SkeletonBox className="h-1/2 flex-1" />
      <SkeletonBox className="h-5/6 flex-1" />
      <SkeletonBox className="h-3/4 flex-1" />
      <SkeletonBox className="h-2/5 flex-1" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 6 }) => (
  <div className="card-premium overflow-hidden">
    <div className="p-4 border-b border-warmgrey/70 flex items-center justify-between">
      <SkeletonBox className="h-9 w-64 rounded-lg" />
      <div className="flex gap-2">
        <SkeletonBox className="h-9 w-28 rounded-lg" />
        <SkeletonBox className="h-9 w-28 rounded-lg" />
      </div>
    </div>
    <div className="p-4 space-y-3">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center space-x-4 py-2 border-b border-warmgrey/40 last:border-0">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <SkeletonBox key={cIdx} className={`h-4 ${cIdx === 0 ? 'w-24' : cIdx === 1 ? 'w-36' : 'flex-1'}`} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const ErrorState = ({ message = 'Failed to load records from database.', onRetry }) => (
  <div className="card-premium p-8 text-center border-red-200 bg-red-50/40">
    <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-3">
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h3 className="text-sm font-semibold text-charcoal">Unable to Retrieve Data</h3>
    <p className="text-xs text-muted max-w-sm mx-auto mt-1 mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="btn-primary text-xs py-1.5 px-4 shadow-sm inline-flex items-center space-x-1.5"
      >
        <span>Retry Request</span>
      </button>
    )}
  </div>
);
