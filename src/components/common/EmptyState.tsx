import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  message?: string;
  action?: ReactNode;
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
      <p className="text-base font-medium text-slate-700 dark:text-slate-300">{title}</p>
      {message && <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">{message}</p>}
      {action}
    </div>
  );
}
