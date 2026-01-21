/**
 * Git Helper interface
 * Represents a single git helper function
 */
export interface GitHelper {
  id: string;
  name: string;
  description: string;
  command?: string;
  requiresInput: boolean;
  requiresConfirmation?: boolean;
  inputPrompt?: string;
  inputType?: 'number' | 'text';
  inputPlaceholder?: string;
  opensWebview?: boolean;
}

/**
 * GitHub Helpers service for managing predefined git helper functions
 * Provides access to commonly used git operations
 */
export class GitHubHelpersService {
  /**
   * Get all predefined git helpers
   */
  getAllHelpers(): GitHelper[] {
    return [
      // Rebase Operations
      {
        id: 'rebase-interactive',
        name: 'Interactive Rebase',
        description: 'Start interactive rebase to squash/edit commits',
        command: 'git rebase -i HEAD~{n}',
        requiresInput: true,
        inputPrompt: 'Number of commits to rebase',
        inputType: 'number',
        inputPlaceholder: 'e.g., 3',
      },
      {
        id: 'rebase-continue',
        name: 'Rebase Continue',
        description: 'Continue rebase after resolving conflicts',
        command: 'git rebase --continue',
        requiresInput: false,
      },
      {
        id: 'rebase-abort',
        name: 'Rebase Abort',
        description: 'Cancel rebase operation',
        command: 'git rebase --abort',
        requiresInput: false,
      },
      // Commit Operations
      {
        id: 'amend-no-edit',
        name: 'Amend (No Edit)',
        description:
          'Add staged changes to last commit without editing message',
        command: 'git commit --amend --no-edit',
        requiresInput: false,
      },
      {
        id: 'amend-edit',
        name: 'Amend (Edit)',
        description: 'Edit last commit message and add staged changes',
        command: 'git commit --amend',
        requiresInput: false,
      },
      // Reset Operations
      {
        id: 'reset-soft',
        name: 'Reset Soft',
        description: 'Undo commits but keep changes staged',
        command: 'git reset --soft HEAD~{n}',
        requiresInput: true,
        inputPrompt: 'Number of commits to reset',
        inputType: 'number',
        inputPlaceholder: 'e.g., 2',
      },
      {
        id: 'reset-hard',
        name: 'Reset Hard',
        description: 'Undo commits and discard all changes (destructive)',
        command: 'git reset --hard HEAD~{n}',
        requiresInput: true,
        requiresConfirmation: true,
        inputPrompt: 'Number of commits to reset',
        inputType: 'number',
        inputPlaceholder: 'e.g., 2',
      },
      // Clean Operations
      {
        id: 'clean-untracked',
        name: 'Clean Untracked Files',
        description: 'Remove untracked files and directories (destructive)',
        command: 'git clean -fd',
        requiresInput: false,
        requiresConfirmation: true,
      },
      // Cherry-pick & Revert
      {
        id: 'cherry-pick',
        name: 'Cherry-pick',
        description: 'Apply changes from a specific commit',
        command: 'git cherry-pick {hash}',
        requiresInput: true,
        inputPrompt: 'Commit hash',
        inputType: 'text',
        inputPlaceholder: 'e.g., abc1234',
      },
      {
        id: 'revert',
        name: 'Revert',
        description: 'Create new commit that undoes changes from a commit',
        command: 'git revert {hash}',
        requiresInput: true,
        inputPrompt: 'Commit hash to revert',
        inputType: 'text',
        inputPlaceholder: 'e.g., abc1234',
      },
      // Log & History
      {
        id: 'log-graph',
        name: 'Log Graph',
        description: 'Show visual commit history with graph',
        command: 'git log --oneline --graph --all --decorate',
        requiresInput: false,
      },
      {
        id: 'show-commit',
        name: 'Show Commit',
        description: 'View details of a specific commit',
        command: 'git show {hash}',
        requiresInput: true,
        inputPrompt: 'Commit hash',
        inputType: 'text',
        inputPlaceholder: 'e.g., abc1234',
      },
      // Diff Operations
      {
        id: 'diff-staged',
        name: 'Diff Staged',
        description: 'View changes in staged files',
        command: 'git diff --staged',
        requiresInput: false,
      },
      // Backmerge
      {
        id: 'backmerge',
        name: 'Backmerge',
        description: 'Open webview to manage branch merges with source and destination branches',
        requiresInput: false,
        opensWebview: true,
      },
    ];
  }

  /**
   * Get a helper by ID
   */
  getHelperById(id: string): GitHelper | undefined {
    return this.getAllHelpers().find(helper => helper.id === id);
  }

  /**
   * Build command from helper template with input values
   */
  buildCommand(helper: GitHelper, input?: string): string {
    if (!helper.command) {
      throw new Error('Helper does not have a command');
    }

    let command = helper.command;

    // Replace placeholders with input values
    if (input !== undefined && input !== '') {
      if (helper.inputType === 'number') {
        // Validate number input
        const num = parseInt(input, 10);
        if (isNaN(num) || num <= 0) {
          throw new Error('Input must be a positive number');
        }
        command = command.replace(/{n}/g, input);
      } else {
        // Text input (e.g., commit hash)
        command = command.replace(/{hash}/g, input);
      }
    }

    return command;
  }
}
