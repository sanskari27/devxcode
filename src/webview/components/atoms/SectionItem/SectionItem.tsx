import { cn } from '@lib/utils';
import { FileCode, Trash } from 'lucide-react';
import React from 'react';

interface SectionItemProps {
  name: string;
  onClick?: () => void;
  icon?: React.ElementType;
  className?: string;
  iconClassName?: string;
  action?: () => void;
  actionIcon?: React.ElementType;
}

export const SectionItem: React.FC<SectionItemProps> = ({
  name,
  onClick,
  icon,
  className,
  iconClassName,
  action,
  actionIcon,
}) => {
  const Icon = (icon as React.ElementType) || FileCode;
  const ActionIcon = actionIcon || Trash;
  const hasLineClamp = className?.includes('line-clamp');
  const containerClasses =
    className
      ?.split(' ')
      .filter(c => !c.includes('line-clamp'))
      .join(' ') || '';
  const lineClampClass =
    className?.split(' ').find(c => c.includes('line-clamp')) || '';

  const handleAction = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    action?.();
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2 py-1 rounded cursor-pointer',
        'hover:bg-[var(--vscode-list-hoverBackground)]',
        'active:bg-[var(--vscode-list-activeSelectionBackground)]',
        'transition-colors',
        'text-[var(--vscode-foreground)]',
        containerClasses
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <Icon
        className={cn(
          'h-4 w-4 flex-shrink-0 text-[var(--vscode-icon-foreground)]',
          iconClassName
        )}
        style={{ opacity: 0.7 }}
      />
      <span
        className={cn(
          'text-sm flex-1',
          hasLineClamp ? lineClampClass : 'truncate'
        )}
      >
        {name}
      </span>
      {action && (
        <button
          onClick={handleAction}
          className={cn(
            'p-1 rounded cursor-pointer',
            'hover:bg-[var(--vscode-list-hoverBackground)]',
            'transition-colors',
            'flex items-center justify-center'
          )}
          tabIndex={0}
        >
          <ActionIcon className="h-3.5 w-3.5 text-[var(--vscode-icon-foreground)]" />
        </button>
      )}
    </div>
  );
};
