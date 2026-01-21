import { BranchSelector, BranchStatusIndicator, CommitList } from '@components/molecules';
import React from 'react';
import type { BranchStatus } from '@components/molecules/BranchStatusIndicator';
import type { Commit } from '@components/molecules/CommitList';

export interface SourceBranchSectionProps {
  branches: string[];
  selectedBranch: string;
  status: BranchStatus | null;
  loadingBranches: boolean;
  loadingStatus: boolean;
  pulling: boolean;
  commits: Commit[];
  loadingCommits: boolean;
  hasMoreCommits: boolean;
  selectedCommitIds: Set<string>;
  onBranchChange: (branch: string) => void;
  onPull: () => void;
  onToggleCommit: (commitId: string) => void;
  onLoadMore: () => void;
}

export const SourceBranchSection: React.FC<SourceBranchSectionProps> = ({
  branches,
  selectedBranch,
  status,
  loadingBranches,
  loadingStatus,
  pulling,
  commits,
  loadingCommits,
  hasMoreCommits,
  selectedCommitIds,
  onBranchChange,
  onPull,
  onToggleCommit,
  onLoadMore,
}) => {
  return (
    <div className="flex-1 flex flex-col gap-4 border-r border-[var(--vscode-panel-border)] pr-6 overflow-hidden">
      <BranchSelector
        id="source-branch"
        label="Source Branch"
        value={selectedBranch}
        branches={branches}
        onChange={onBranchChange}
        disabled={loadingBranches}
        placeholder="Select source branch"
      />

      {selectedBranch && (
        <>
          <BranchStatusIndicator
            status={status}
            loading={loadingStatus}
            pulling={pulling}
            onPull={onPull}
          />

          <CommitList
            commits={commits}
            loading={loadingCommits}
            hasMore={hasMoreCommits}
            selectedCommitIds={selectedCommitIds}
            onToggleCommit={onToggleCommit}
            onLoadMore={onLoadMore}
            showCheckboxes={true}
            title="Commits"
          />
        </>
      )}
    </div>
  );
};
