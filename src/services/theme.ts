import * as vscode from 'vscode';

export interface VSCodeTheme {
  kind: 'light' | 'dark' | 'highContrast';
  colors: {
    '--vscode-editor-background': string;
    '--vscode-editor-foreground': string;
    '--vscode-sideBar-background': string;
    '--vscode-sideBar-foreground': string;
    '--vscode-sideBarTitle-foreground': string;
    '--vscode-list-activeSelectionBackground': string;
    '--vscode-list-activeSelectionForeground': string;
    '--vscode-list-hoverBackground': string;
    '--vscode-input-background': string;
    '--vscode-input-foreground': string;
    '--vscode-input-border': string;
    '--vscode-input-placeholderForeground': string;
    '--vscode-button-background': string;
    '--vscode-button-foreground': string;
    '--vscode-button-hoverBackground': string;
    '--vscode-button-secondaryBackground': string;
    '--vscode-button-secondaryForeground': string;
    '--vscode-button-secondaryHoverBackground': string;
    '--vscode-textLink-foreground': string;
    '--vscode-textLink-activeForeground': string;
    '--vscode-focusBorder': string;
    '--vscode-errorForeground': string;
    '--vscode-warningForeground': string;
    '--vscode-foreground': string;
    '--vscode-descriptionForeground': string;
    '--vscode-icon-foreground': string;
    '--vscode-panel-border': string;
    '--vscode-inputOption-hoverBorder': string;
  };
}

/**
 * Get VS Code theme information
 * VS Code webviews automatically provide CSS variables like --vscode-editor-background
 * We return the CSS variable names so the webview can reference them
 * The actual color values are provided by VS Code automatically
 */
export function getVSCodeTheme(): VSCodeTheme {
  const colorTheme = vscode.window.activeColorTheme;

  const kind =
    colorTheme.kind === vscode.ColorThemeKind.Light
      ? 'light'
      : colorTheme.kind === vscode.ColorThemeKind.Dark
        ? 'dark'
        : 'highContrast';

  // Return CSS variable names - VS Code webviews automatically provide these
  // The webview will use these variables directly via var() in CSS
  return {
    kind,
    colors: {
      '--vscode-editor-background': 'var(--vscode-editor-background)',
      '--vscode-editor-foreground': 'var(--vscode-editor-foreground)',
      '--vscode-sideBar-background': 'var(--vscode-sideBar-background)',
      '--vscode-sideBar-foreground': 'var(--vscode-sideBar-foreground)',
      '--vscode-sideBarTitle-foreground':
        'var(--vscode-sideBarTitle-foreground)',
      '--vscode-list-activeSelectionBackground':
        'var(--vscode-list-activeSelectionBackground)',
      '--vscode-list-activeSelectionForeground':
        'var(--vscode-list-activeSelectionForeground)',
      '--vscode-list-hoverBackground': 'var(--vscode-list-hoverBackground)',
      '--vscode-input-background': 'var(--vscode-input-background)',
      '--vscode-input-foreground': 'var(--vscode-input-foreground)',
      '--vscode-input-border': 'var(--vscode-input-border)',
      '--vscode-input-placeholderForeground':
        'var(--vscode-input-placeholderForeground)',
      '--vscode-button-background': 'var(--vscode-button-background)',
      '--vscode-button-foreground': 'var(--vscode-button-foreground)',
      '--vscode-button-hoverBackground': 'var(--vscode-button-hoverBackground)',
      '--vscode-button-secondaryBackground':
        'var(--vscode-button-secondaryBackground)',
      '--vscode-button-secondaryForeground':
        'var(--vscode-button-secondaryForeground)',
      '--vscode-button-secondaryHoverBackground':
        'var(--vscode-button-secondaryHoverBackground)',
      '--vscode-textLink-foreground': 'var(--vscode-textLink-foreground)',
      '--vscode-textLink-activeForeground':
        'var(--vscode-textLink-activeForeground)',
      '--vscode-focusBorder': 'var(--vscode-focusBorder)',
      '--vscode-errorForeground': 'var(--vscode-errorForeground)',
      '--vscode-warningForeground': 'var(--vscode-warningForeground)',
      '--vscode-foreground': 'var(--vscode-foreground)',
      '--vscode-descriptionForeground': 'var(--vscode-descriptionForeground)',
      '--vscode-icon-foreground': 'var(--vscode-icon-foreground)',
      '--vscode-panel-border': 'var(--vscode-panel-border)',
      '--vscode-inputOption-hoverBorder':
        'var(--vscode-inputOption-hoverBorder)',
    },
  };
}
