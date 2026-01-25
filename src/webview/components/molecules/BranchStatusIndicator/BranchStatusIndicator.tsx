import { Download } from 'lucide-react';
import React from 'react';

export interface BranchStatus {
  isBehind: boolean;
  commitCount: number;
}

export interface BranchStatusIndicatorProps {
  status: BranchStatus | null;
  loading: boolean;
  pulling: boolean;
  onPull: () => void;
}

export const BranchStatusIndicator: React.FC<BranchStatusIndicatorProps> = ({
  status,
  loading,
  pulling,
  onPull,
}) => {
  if (loading) {
    return (
      <div className="text-xs text-[var(--vscode-descriptionForeground)]">
        Checking status...
      </div>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <>
      {status.isBehind && (
        <button
          onClick={onPull}
          disabled={pulling}
          className="px-4 py-2 text-sm font-medium bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] rounded hover:bg-[var(--vscode-button-hoverBackground)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {pulling ? (
            <>
              <span className="animate-spin">⏳</span>
              Pulling...
            </>
          ) : (
            <>
              <Download size={16} />
              Pull Latest Changes
            </>
          )}
        </button>
      )}
      <div className="text-xs text-[var(--vscode-descriptionForeground)]">
        {status.isBehind
          ? `${status.commitCount} commit(s) behind remote`
          : 'Up to date with remote'}
      </div>
    </>
  );
};
