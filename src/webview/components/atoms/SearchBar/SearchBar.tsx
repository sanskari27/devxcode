import { Search } from 'lucide-react';
import React, { useCallback } from 'react';
import { cn } from '@lib/utils';

export interface SearchBarProps {
  placeholder?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  iconClassName?: string;
  inputClassName?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  onValueChange,
  className,
  size = 'md',
  value,
  defaultValue,
  disabled = false,
  autoFocus = false,
  iconClassName,
  inputClassName,
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange?.(e.target.value);
    },
    [onValueChange]
  );

  // Size-based styling
  const sizeStyles = {
    sm: {
      container: 'h-7 px-2',
      icon: 'h-3 w-3',
      input: 'text-xs px-1.5',
      gap: 'gap-1.5',
    },
    md: {
      container: 'h-8 px-2.5',
      icon: 'h-4 w-4',
      input: 'text-sm px-2',
      gap: 'gap-2',
    },
    lg: {
      container: 'h-10 px-3',
      icon: 'h-5 w-5',
      input: 'text-base px-2.5',
      gap: 'gap-2.5',
    },
  };

  const currentSizeStyles = sizeStyles[size];

  return (
    <div
      className={cn(
        'flex items-center',
        'border border-[var(--vscode-input-border)]',
        'bg-[var(--vscode-input-background)]',
        'rounded',
        'transition-all',
        'focus-within:border-[var(--vscode-focusBorder)]',
        'focus-within:outline-none',
        disabled && 'opacity-50 cursor-not-allowed',
        currentSizeStyles.container,
        currentSizeStyles.gap,
        className
      )}
    >
      <Search
        className={cn(
          'flex-shrink-0 text-[var(--vscode-icon-foreground)]',
          currentSizeStyles.icon,
          iconClassName
        )}
        style={{ opacity: 0.7 }}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn(
          'flex-1 bg-transparent',
          'text-[var(--vscode-input-foreground)]',
          'placeholder:text-[var(--vscode-input-placeholderForeground)]',
          'border-none outline-none',
          'focus:outline-none',
          currentSizeStyles.input,
          inputClassName
        )}
      />
    </div>
  );
};
