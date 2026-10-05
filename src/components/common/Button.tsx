import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 dark:disabled:text-indigo-400',
  secondary:
    'bg-slate-100 text-slate-900 hover:bg-slate-200 disabled:text-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:disabled:text-slate-500',
  danger:
    'bg-rose-600 text-white hover:bg-rose-500 disabled:bg-rose-300 dark:disabled:bg-rose-800 dark:disabled:text-rose-400',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 disabled:text-slate-300 dark:text-slate-300 dark:hover:bg-slate-800 dark:disabled:text-slate-600',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md';
}

export function Button({ variant = 'secondary', size = 'md', className = '', ...rest }: ButtonProps) {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-1 text-sm' : 'px-4 py-2 text-sm';
  return (
    <button
      className={`rounded-md font-medium transition-colors disabled:cursor-not-allowed ${sizeClasses} ${variantClasses[variant]} ${className}`}
      {...rest}
    />
  );
}
