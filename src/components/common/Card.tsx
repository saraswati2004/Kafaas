import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  bordered?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = false,
  bordered = true,
  padding = 'md',
  className,
  ...props
}) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      className={clsx(
        'bg-white rounded-2xl transition-all duration-200',
        bordered && 'border border-slate-200/80',
        'shadow-soft',
        hoverEffect && 'hover:shadow-soft-lg hover:-translate-y-0.5 hover:border-emerald-200/80',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
