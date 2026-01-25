import { SelectedCommitsList } from '@components/molecules';
import {
  DestinationBranchSection,
  SourceBranchSection,
} from '@components/organisms';
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
    generateBackmergeBranch,
    backmergeError,
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
          <div className="text-[var(--vscode-foreground)]">
            Loading branches...
          </div>
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

          {/* Generate Backmerge Branch Button */}
          <div className="flex flex-col items-center pt-4">
            {backmergeError && (
              <div className="text-sm mb-2 text-[var(--vscode-errorForeground)] max-w-2xl text-center">
                {backmergeError}
              </div>
            )}
            <button
              onClick={generateBackmergeBranch}
              disabled={!destinationBranch}
              className="px-6 py-1.5 text-base font-medium bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] rounded hover:bg-[var(--vscode-button-hoverBackground)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--vscode-focusBorder)]"
            >
              Generate Backmerge Branch
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
