import React from 'react';

export const LoadingSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 animate-pulse space-y-4"
        >
          <div className="w-full h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2" />
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      ))}
    </div>
  );
};
