import React from 'react';

export interface BranchSelectorProps {
  id: string;
  label: string;
  value: string;
  branches: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const BranchSelector: React.FC<BranchSelectorProps> = ({
  id,
  label,
  value,
  branches,
  onChange,
  disabled = false,
  placeholder = 'Select branch',
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-sm font-medium text-[var(--vscode-foreground)]"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="px-3 py-2 text-sm bg-[var(--vscode-dropdown-background)] text-[var(--vscode-dropdown-foreground)] border border-[var(--vscode-dropdown-border)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--vscode-focusBorder)]"
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {branches.map(branch => (
          <option key={branch} value={branch}>
            {branch}
          </option>
        ))}
      </select>
    </div>
  );
};
