import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'gray' | 'earth';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'green',
  size = 'md',
  dot = false,
  className,
  icon,
}) => {
  const variants = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    blue: 'bg-blue-50 text-blue-700 border-blue-200/60',
    yellow: 'bg-amber-50 text-amber-800 border-amber-200/60',
    red: 'bg-red-50 text-red-700 border-red-200/60',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/60',
    gray: 'bg-slate-100 text-slate-700 border-slate-200/60',
    earth: 'bg-orange-50 text-orange-800 border-orange-200/60',
  };

  const dotColors = {
    green: 'bg-emerald-500',
    blue: 'bg-blue-500',
    yellow: 'bg-amber-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    gray: 'bg-slate-400',
    earth: 'bg-orange-500',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {icon && <span className="inline-flex">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
