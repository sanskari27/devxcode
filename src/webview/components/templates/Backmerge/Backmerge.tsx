import { DestinationBranchSection, SourceBranchSection } from '@components/organisms';
import { SelectedCommitsList } from '@components/molecules';
import React from 'react';
import { useBackmergeService } from '../../../hooks/useBackmergeService';

export const Backmerge: React.FC = () => {
  const {
    branches,
    sourceBranch,
    destinationBranch,
    sourceStatus,
    destinationStatus,
    loadingBranches,
    loadingSourceStatus,
    loadingDestStatus,
    pullingSource,
    pullingDest,
    handleSourceBranchChange,
    handleDestinationBranchChange,
    pullSourceBranch,
    pullDestinationBranch,
    sourceCommits,
    destinationCommits,
    selectedCommits,
    selectedCommitsList,
    loadingSourceCommits,
    loadingDestCommits,
    hasMoreSourceCommits,
    hasMoreDestCommits,
    toggleCommitSelection,
    loadMoreSourceCommits,
    loadMoreDestinationCommits,
  } = useBackmergeService();

  return (
    <div className="w-full h-full p-6 flex flex-col">
      <h1 className="text-2xl font-semibold mb-6 text-[var(--vscode-foreground)]">
        Backmerge
      </h1>

      {loadingBranches ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-[var(--vscode-foreground)]">Loading branches...</div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 h-full overflow-hidden">
          {/* Source and Destination Row */}
          <div className="flex flex-row gap-6 flex-1 min-h-0 overflow-hidden">
            <SourceBranchSection
              branches={branches}
              selectedBranch={sourceBranch}
              status={sourceStatus}
              loadingBranches={loadingBranches}
              loadingStatus={loadingSourceStatus}
              pulling={pullingSource}
              commits={sourceCommits}
              loadingCommits={loadingSourceCommits}
              hasMoreCommits={hasMoreSourceCommits}
              selectedCommitIds={selectedCommits}
              onBranchChange={handleSourceBranchChange}
              onPull={pullSourceBranch}
              onToggleCommit={toggleCommitSelection}
              onLoadMore={loadMoreSourceCommits}
            />

            <DestinationBranchSection
              branches={branches}
              selectedBranch={destinationBranch}
              status={destinationStatus}
              loadingBranches={loadingBranches}
              loadingStatus={loadingDestStatus}
              pulling={pullingDest}
              commits={destinationCommits}
              loadingCommits={loadingDestCommits}
              hasMoreCommits={hasMoreDestCommits}
              onBranchChange={handleDestinationBranchChange}
              onPull={pullDestinationBranch}
              onLoadMore={loadMoreDestinationCommits}
            />
          </div>

          {/* Selected Commits Section - Below Source and Destination */}
          <SelectedCommitsList commits={selectedCommitsList} />
        </div>
      )}
    </div>
  );
};
