import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionHref?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-2xl border border-slate-200/80 shadow-soft max-w-md mx-auto my-6">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionText}
        </Button>
      )}
    </div>
  );
};
