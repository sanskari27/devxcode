import { showNotification } from '@src/webview/utils/notifications';
import { useCallback, useEffect, useState } from 'react';

declare const vscode: {
  postMessage: (message: unknown) => void;
};

interface BranchStatus {
  isBehind: boolean;
  commitCount: number;
}

export interface Commit {
  id: string;
  message: string;
  description: string;
  dateTime: string;
  committer: string;
}

export function useBackmergeService() {
  const [branches, setBranches] = useState<string[]>([]);
  const [sourceBranch, setSourceBranch] = useState<string>('');
  const [destinationBranch, setDestinationBranch] = useState<string>('');
  const [sourceStatus, setSourceStatus] = useState<BranchStatus | null>(null);
  const [destinationStatus, setDestinationStatus] =
    useState<BranchStatus | null>(null);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingSourceStatus, setLoadingSourceStatus] = useState(false);
  const [loadingDestStatus, setLoadingDestStatus] = useState(false);
  const [pullingSource, setPullingSource] = useState(false);
  const [pullingDest, setPullingDest] = useState(false);

  // Commit-related state
  const [sourceCommits, setSourceCommits] = useState<Commit[]>([]);
  const [destinationCommits, setDestinationCommits] = useState<Commit[]>([]);
  const [selectedCommits, setSelectedCommits] = useState<Set<string>>(
    new Set()
  );
  const [loadingSourceCommits, setLoadingSourceCommits] = useState(false);
  const [loadingDestCommits, setLoadingDestCommits] = useState(false);
  const [sourceCommitsSkip, setSourceCommitsSkip] = useState(0);
  const [destCommitsSkip, setDestCommitsSkip] = useState(0);
  const [hasMoreSourceCommits, setHasMoreSourceCommits] = useState(true);
  const [hasMoreDestCommits, setHasMoreDestCommits] = useState(true);
  const [backmergeError, setBackmergeError] = useState<string | null>(null);

  // Fetch local branches on mount
  useEffect(() => {
    const fetchBranches = () => {
      setLoadingBranches(true);
      if (typeof vscode !== 'undefined') {
        vscode.postMessage({
          command: 'getLocalBranches',
        });
      }
    };

    fetchBranches();

    // Listen for messages from extension
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;

      switch (message.command) {
        case 'localBranches':
          setBranches(message.branches || []);
          setLoadingBranches(false);
          break;

        case 'branchStatus':
          if (message.branchName === sourceBranch) {
            setSourceStatus({
              isBehind: message.isBehind || false,
              commitCount: message.commitCount || 0,
            });
            setLoadingSourceStatus(false);
          }
          if (message.branchName === destinationBranch) {
            setDestinationStatus({
              isBehind: message.isBehind || false,
              commitCount: message.commitCount || 0,
            });
            setLoadingDestStatus(false);
          }
          break;

        case 'pullSuccess':
          if (message.branchName === sourceBranch) {
            setPullingSource(false);
            showNotification(`Successfully pulled ${sourceBranch}`, 'success');
            // Refresh status
            checkBranchStatus(sourceBranch, 'source');
          }
          if (message.branchName === destinationBranch) {
            setPullingDest(false);
            showNotification(
              `Successfully pulled ${destinationBranch}`,
              'success'
            );
            // Refresh status
            checkBranchStatus(destinationBranch, 'destination');
          }
          break;

        case 'branchCommits':
          if (message.branchName === sourceBranch) {
            const commits = message.commits || [];
            // Always append to existing commits (if any)
            setSourceCommits(prev => {
              // If this is the first load (prev is empty), replace; otherwise append
              if (prev.length === 0) {
                return commits;
              }
              return [...prev, ...commits];
            });
            setHasMoreSourceCommits(commits.length === 10); // If we got 10, there might be more
            setLoadingSourceCommits(false);
          }
          if (message.branchName === destinationBranch) {
            const commits = message.commits || [];
            // Always append to existing commits (if any)
            setDestinationCommits(prev => {
              // If this is the first load (prev is empty), replace; otherwise append
              if (prev.length === 0) {
                return commits;
              }
              return [...prev, ...commits];
            });
            setHasMoreDestCommits(commits.length === 10); // If we got 10, there might be more
            setLoadingDestCommits(false);
          }
          break;

        case 'backmergeBranchCreated':
          setBackmergeError(null);
          showNotification(
            `Successfully created branch: ${message.branchName}`,
            'success'
          );
          // Refresh branches list
          if (typeof vscode !== 'undefined') {
            vscode.postMessage({
              command: 'getLocalBranches',
            });
          }
          break;

        case 'backmergeBranchError':
          setBackmergeError(
            message.message || 'An error occurred during backmerge'
          );
          break;

        case 'error':
          showNotification(message.message || 'An error occurred', 'error');
          setLoadingBranches(false);
          setLoadingSourceStatus(false);
          setLoadingDestStatus(false);
          setPullingSource(false);
          setPullingDest(false);
          setLoadingSourceCommits(false);
          setLoadingDestCommits(false);
          break;
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [sourceBranch, destinationBranch]);

  // Check branch status
  const checkBranchStatus = useCallback(
    (branchName: string, type: 'source' | 'destination') => {
      if (!branchName) return;

      if (type === 'source') {
        setLoadingSourceStatus(true);
        setSourceStatus(null);
      } else {
        setLoadingDestStatus(true);
        setDestinationStatus(null);
      }

      if (typeof vscode !== 'undefined') {
        vscode.postMessage({
          command: 'checkBranchStatus',
          branchName,
        });
      }
    },
    []
  );

  // Fetch commits from source branch
  const fetchSourceCommits = useCallback((branch: string, skip: number = 0) => {
    if (!branch) return;

    setLoadingSourceCommits(true);
    if (typeof vscode !== 'undefined') {
      vscode.postMessage({
        command: 'getBranchCommits',
        branchName: branch,
        limit: 10,
        skip,
      });
    }
  }, []);

  // Fetch commits from destination branch
  const fetchDestinationCommits = useCallback(
    (branch: string, skip: number = 0) => {
      if (!branch) return;

      setLoadingDestCommits(true);
      if (typeof vscode !== 'undefined') {
        vscode.postMessage({
          command: 'getBranchCommits',
          branchName: branch,
          limit: 10,
          skip,
        });
      }
    },
    []
  );

  // Load more source commits
  const loadMoreSourceCommits = useCallback(() => {
    if (!sourceBranch || loadingSourceCommits || !hasMoreSourceCommits) return;

    const nextSkip = sourceCommitsSkip + 10;
    setSourceCommitsSkip(nextSkip);
    fetchSourceCommits(sourceBranch, nextSkip);
  }, [
    sourceBranch,
    sourceCommitsSkip,
    loadingSourceCommits,
    hasMoreSourceCommits,
    fetchSourceCommits,
  ]);

  // Load more destination commits
  const loadMoreDestinationCommits = useCallback(() => {
    if (!destinationBranch || loadingDestCommits || !hasMoreDestCommits) return;

    const nextSkip = destCommitsSkip + 10;
    setDestCommitsSkip(nextSkip);
    fetchDestinationCommits(destinationBranch, nextSkip);
  }, [
    destinationBranch,
    destCommitsSkip,
    loadingDestCommits,
    hasMoreDestCommits,
    fetchDestinationCommits,
  ]);

  // Toggle commit selection
  const toggleCommitSelection = useCallback((commitId: string) => {
    setSelectedCommits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commitId)) {
        newSet.delete(commitId);
      } else {
        newSet.add(commitId);
      }
      return newSet;
    });
  }, []);

  // Handle source branch selection
  const handleSourceBranchChange = useCallback(
    (branch: string) => {
      setSourceBranch(branch);
      setSourceStatus(null);
      setSourceCommits([]);
      setSourceCommitsSkip(0);
      setHasMoreSourceCommits(true);
      if (branch) {
        checkBranchStatus(branch, 'source');
        fetchSourceCommits(branch, 0);
      }
    },
    [checkBranchStatus, fetchSourceCommits]
  );

  // Handle destination branch selection
  const handleDestinationBranchChange = useCallback(
    (branch: string) => {
      setDestinationBranch(branch);
      setDestinationStatus(null);
      setDestinationCommits([]);
      setDestCommitsSkip(0);
      setHasMoreDestCommits(true);
      if (branch) {
        checkBranchStatus(branch, 'destination');
        fetchDestinationCommits(branch, 0);
      }
    },
    [checkBranchStatus, fetchDestinationCommits]
  );

  // Pull source branch
  const pullSourceBranch = useCallback(() => {
    if (!sourceBranch) return;

    setPullingSource(true);
    if (typeof vscode !== 'undefined') {
      vscode.postMessage({
        command: 'pullBranch',
        branchName: sourceBranch,
      });
    }
  }, [sourceBranch]);

  // Pull destination branch
  const pullDestinationBranch = useCallback(() => {
    if (!destinationBranch) return;

    setPullingDest(true);
    if (typeof vscode !== 'undefined') {
      vscode.postMessage({
        command: 'pullBranch',
        branchName: destinationBranch,
      });
    }
  }, [destinationBranch]);

  // Generate backmerge branch
  const generateBackmergeBranch = useCallback(() => {
    if (!destinationBranch) {
      showNotification('Please select a destination branch', 'error');
      return;
    }

    // Clear any previous error
    setBackmergeError(null);

    // Get selected commit IDs
    const selectedCommitIds = Array.from(selectedCommits);

    if (typeof vscode !== 'undefined') {
      vscode.postMessage({
        command: 'createBackmergeBranch',
        destinationBranch,
        selectedCommits: selectedCommitIds,
      });
    }
  }, [destinationBranch, selectedCommits]);

  // Get selected commits sorted by dateTime ascending
  const selectedCommitsList = Array.from(selectedCommits)
    .map(id => sourceCommits.find(c => c.id === id))
    .filter((c): c is Commit => c !== undefined)
    .sort((a, b) => {
      // Parse dateTime for comparison: DD/MM/YYYY HH:MM:SS A
      const parseDate = (dt: string) => {
        const [datePart, timePart, ampm] = dt.split(' ');
        const [day, month, year] = datePart.split('/').map(Number);
        const [hours, minutes, seconds] = timePart.split(':').map(Number);
        let hour24 = hours;
        if (ampm === 'PM' && hours !== 12) hour24 += 12;
        if (ampm === 'AM' && hours === 12) hour24 = 0;
        return new Date(year, month - 1, day, hour24, minutes, seconds);
      };
      return parseDate(a.dateTime).getTime() - parseDate(b.dateTime).getTime();
    });

  return {
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
    // Commit-related exports
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
  };
}
