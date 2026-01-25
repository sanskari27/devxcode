import * as vscode from 'vscode';
import { RepositoriesService } from '../../services/repositories';
import { getGitRemoteUrl } from '../utils/gitUtils';

export function handleOpenRepositoryMessage(
  message: Record<string, unknown>,
  repositoriesService: RepositoriesService
) {
  switch (message.command) {
    case 'openRepository':
      if (message.path) {
        const uri = vscode.Uri.file(message.path as string);
        // Open folder in a new window
        vscode.commands.executeCommand('vscode.openFolder', uri, true).then(
          () => {
            // Update lastOpened when repository is opened
            repositoriesService
              .updateLastOpened(message.path as string)
              .catch(error => {
                console.error('Failed to update lastOpened:', error);
              });
          },
          error => {
            console.error('Failed to open repository:', error);
            vscode.window.showErrorMessage(
              `Failed to open repository: ${error}`
            );
          }
        );
      }
      return;
    case 'openGitHubRepository':
      if (message.path) {
        const repositoryPath = message.path as string;
        getGitRemoteUrl(repositoryPath)
          .then(githubUrl => {
            if (githubUrl) {
              vscode.env.openExternal(vscode.Uri.parse(githubUrl));
            } else {
              vscode.window.showInformationMessage(
                'GitHub repository URL not available for this repository'
              );
            }
          })
          .catch(error => {
            console.error('Failed to get GitHub URL:', error);
            vscode.window.showErrorMessage(
              'Failed to get GitHub repository URL'
            );
          });
      }
      return;
  }
}
