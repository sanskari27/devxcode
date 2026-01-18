import { cn } from '@lib/utils';
import React from 'react';

export interface CheckboxProps {
  checked?: boolean;
  label: string;
  onClick?: () => void;
  className?: string;
  name?: string;
  value?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  label,
  onClick,
  className,
  name,
  value,
}) => {
  return (
    <label
      className={cn(
        'flex items-center gap-2 cursor-pointer',
        'text-[var(--vscode-foreground)]',
        'select-none',
        className
      )}
      onClick={onClick}
    >
      <input
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        onChange={onClick}
        className="sr-only"
      />
      <div
        className={cn(
          'flex items-center justify-center',
          'border-2 border-[var(--vscode-input-border)]',
          'bg-[var(--vscode-input-background)]',
          'transition-all',
          'rounded w-4 h-4',
          checked && 'border-[var(--vscode-focusBorder)]',
          'hover:border-[var(--vscode-inputOption-hoverBorder)]'
        )}
      >
        {checked && (
          <div
            className={cn(
              'bg-[var(--vscode-focusBorder)]',
              'transition-all',
              'rounded w-2 h-2'
            )}
          />
        )}
      </div>
      <span className="text-sm text-[var(--vscode-foreground)]">{label}</span>
    </label>
  );
};
