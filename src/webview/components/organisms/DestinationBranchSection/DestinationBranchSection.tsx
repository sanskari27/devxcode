import { BranchSelector, BranchStatusIndicator, CommitList } from '@components/molecules';
import React from 'react';
import type { BranchStatus } from '@components/molecules/BranchStatusIndicator';
import type { Commit } from '@components/molecules/CommitList';

export interface DestinationBranchSectionProps {
  branches: string[];
  selectedBranch: string;
  status: BranchStatus | null;
  loadingBranches: boolean;
  loadingStatus: boolean;
  pulling: boolean;
  commits: Commit[];
  loadingCommits: boolean;
  hasMoreCommits: boolean;
  onBranchChange: (branch: string) => void;
  onPull: () => void;
  onLoadMore: () => void;
}

export const DestinationBranchSection: React.FC<DestinationBranchSectionProps> = ({
  branches,
  selectedBranch,
  status,
  loadingBranches,
  loadingStatus,
  pulling,
  commits,
  loadingCommits,
  hasMoreCommits,
  onBranchChange,
  onPull,
  onLoadMore,
}) => {
  return (
    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
      <BranchSelector
        id="destination-branch"
        label="Destination Branch"
        value={selectedBranch}
        branches={branches}
        onChange={onBranchChange}
        disabled={loadingBranches}
        placeholder="Select destination branch"
      />

      {selectedBranch ? (
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
            onLoadMore={onLoadMore}
            showCheckboxes={false}
            title="Destination Commits"
          />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-[var(--vscode-descriptionForeground)]">
          Select a destination branch to view commits
        </div>
      )}
    </div>
  );
};
