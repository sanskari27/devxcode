import * as vscode from 'vscode';
import { DumpsService } from '../../services/dumps';
import { RepositoriesService } from '../../services/repositories';
import { StorageService } from '../../services/storage';
import { handleOpenBackmergeWebviewMessage } from './backmergeHandler';
import { handleOpenDumpEditorMessage } from './dumpHandler';
import { handleGitHelperMessage } from './gitHelperHandler';
import { handleNotificationMessage } from './notificationHandler';
import { handleOpenRepositoryMessage } from './repositoryHandler';
import { handleStorageMessage } from './storageHandler';
import { handleThemeMessage } from './themeHandler';
import { handleOpenToolEditorMessage } from './toolEditorHandler';

export function handleMessage(
    message: Record<string, unknown>,
    postMessage: (message: unknown) => void,
    {
        storage,
        repositoriesService,
        dumpsService,
        context,
        extensionUri,
    }: {
        storage: StorageService;
        repositoriesService: RepositoriesService;
        dumpsService: DumpsService;
        context: vscode.ExtensionContext;
        extensionUri: vscode.Uri;
    }
) {
    console.log('handleMessage', message);
    handleStorageMessage(message, storage, postMessage);
    handleThemeMessage(message, postMessage);
    handleNotificationMessage(message);
    handleOpenRepositoryMessage(message, repositoriesService);
    handleOpenDumpEditorMessage(
        message,
        dumpsService,
        context,
        storage,
        postMessage
    );
    handleGitHelperMessage(message);
    handleOpenToolEditorMessage(message, context, extensionUri);
    handleOpenBackmergeWebviewMessage(message, context, extensionUri, postMessage);
}
