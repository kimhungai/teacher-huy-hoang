import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'sky' | 'amber' | 'emerald' | 'rose' | 'slate' | 'indigo';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'sky', size = 'sm' }) => {
  const styles = {
    sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
  };

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-lg border ${styles[variant]} ${sizeClasses}`}>
      {children}
    </span>
  );
};
