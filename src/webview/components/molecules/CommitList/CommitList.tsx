import { Checkbox } from '@components/atoms';
import React from 'react';

export interface Commit {
  id: string;
  message: string;
  description: string;
  dateTime: string;
  committer: string;
}

export interface CommitListProps {
  commits: Commit[];
  loading: boolean;
  hasMore: boolean;
  selectedCommitIds?: Set<string>;
  onToggleCommit?: (commitId: string) => void;
  onLoadMore?: () => void;
  showCheckboxes?: boolean;
  title?: string;
}

export const CommitList: React.FC<CommitListProps> = ({
  commits,
  loading,
  hasMore,
  selectedCommitIds,
  onToggleCommit,
  onLoadMore,
  showCheckboxes = false,
  title = 'Commits',
}) => {
  return (
    <div className="flex flex-col gap-2 flex-1 overflow-hidden">
      <h3 className="text-sm font-medium text-[var(--vscode-foreground)]">
        {title}
      </h3>
      <div className="flex-1 overflow-y-auto border border-[var(--vscode-panel-border)] rounded p-2 bg-[var(--vscode-editor-background)]">
        {loading && commits.length === 0 ? (
          <div className="text-sm text-[var(--vscode-descriptionForeground)] py-4 text-center">
            Loading commits...
          </div>
        ) : commits.length === 0 ? (
          <div className="text-sm text-[var(--vscode-descriptionForeground)] py-4 text-center">
            No commits found
          </div>
        ) : (
          <>
            {commits.map(commit => (
              <div
                key={commit.id}
                className="py-2 border-b border-[var(--vscode-panel-border)] last:border-b-0"
              >
                {showCheckboxes && onToggleCommit ? (
                  <Checkbox
                    checked={selectedCommitIds?.has(commit.id) || false}
                    label={`${commit.message} - ${commit.committer} - ${commit.dateTime}`}
                    onClick={() => onToggleCommit(commit.id)}
                    className="w-full"
                  />
                ) : (
                  <div className="text-sm text-[var(--vscode-foreground)]">
                    {commit.message} - {commit.committer} - {commit.dateTime}
                  </div>
                )}
              </div>
            ))}
            {hasMore && onLoadMore && (
              <div className="pt-2">
                <button
                  onClick={onLoadMore}
                  disabled={loading}
                  className="w-full px-3 py-2 text-sm bg-[var(--vscode-button-secondaryBackground)] text-[var(--vscode-button-secondaryForeground)] rounded hover:bg-[var(--vscode-button-secondaryHoverBackground)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
