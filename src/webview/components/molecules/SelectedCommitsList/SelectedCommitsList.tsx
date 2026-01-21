import React from 'react';
import type { Commit } from '../CommitList';

export interface SelectedCommitsListProps {
  commits: Commit[];
}

export const SelectedCommitsList: React.FC<SelectedCommitsListProps> = ({
  commits,
}) => {
  return (
    <div className="flex flex-col gap-2 border-t border-[var(--vscode-panel-border)] pt-4" style={{ maxHeight: '40%' }}>
      <h3 className="text-sm font-medium text-[var(--vscode-foreground)]">
        Selected Commits ({commits.length})
      </h3>
      <div
        className="flex-1 overflow-y-auto border border-[var(--vscode-panel-border)] rounded p-2 bg-[var(--vscode-editor-background)]"
        style={{ minHeight: '150px', maxHeight: '300px' }}
      >
        {commits.length === 0 ? (
          <div className="text-sm text-[var(--vscode-descriptionForeground)] py-4 text-center">
            No commits selected
          </div>
        ) : (
          commits.map(commit => (
            <div
              key={commit.id}
              className="py-2 border-b border-[var(--vscode-panel-border)] last:border-b-0 text-sm text-[var(--vscode-foreground)]"
            >
              {commit.message} - {commit.committer} - {commit.dateTime}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
