import { showNotification } from '@src/webview/utils/notifications';
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
 * Get VS Code theme colors
 * Note: VS Code webviews automatically provide CSS variables like --vscode-editor-background
 * We return the CSS variable names so the webview can use them directly via var() in CSS
 * The webview will automatically resolve these from VS Code's theme
 */
export function getVSCodeTheme(): VSCodeTheme {
  const colorTheme = vscode.window.activeColorTheme;
  
  // Helper to get CSS variable name
  // VS Code webviews automatically provide these variables, so we just return the variable reference
  const getColorVar = (colorId: string): string => {
    // Convert color ID (e.g., 'editor.background') to CSS variable name (e.g., '--vscode-editor-background')
    // Return as a CSS variable reference that webview can use
    const cssVarName = `--vscode-${colorId.replace(/\./g, '-')}`;
    // Return the variable name without var() wrapper - App.tsx will use it correctly
    return cssVarName;
  };

  const kind = colorTheme.kind === vscode.ColorThemeKind.Light ? 'light' : 
               colorTheme.kind === vscode.ColorThemeKind.Dark ? 'dark' : 'highContrast';
  
  return {
    kind,
    colors: {
      '--vscode-editor-background': getColorVar('editor.background'),
      '--vscode-editor-foreground': getColorVar('editor.foreground'),
      '--vscode-sideBar-background': getColorVar('sideBar.background'),
      '--vscode-sideBar-foreground': getColorVar('sideBar.foreground'),
      '--vscode-sideBarTitle-foreground': getColorVar('sideBarTitle.foreground'),
      '--vscode-list-activeSelectionBackground': getColorVar('list.activeSelectionBackground'),
      '--vscode-list-activeSelectionForeground': getColorVar('list.activeSelectionForeground'),
      '--vscode-list-hoverBackground': getColorVar('list.hoverBackground'),
      '--vscode-input-background': getColorVar('input.background'),
      '--vscode-input-foreground': getColorVar('input.foreground'),
      '--vscode-input-border': getColorVar('input.border'),
      '--vscode-input-placeholderForeground': getColorVar('input.placeholderForeground'),
      '--vscode-button-background': getColorVar('button.background'),
      '--vscode-button-foreground': getColorVar('button.foreground'),
      '--vscode-button-hoverBackground': getColorVar('button.hoverBackground'),
      '--vscode-button-secondaryBackground': getColorVar('button.secondaryBackground'),
      '--vscode-button-secondaryForeground': getColorVar('button.secondaryForeground'),
      '--vscode-button-secondaryHoverBackground': getColorVar('button.secondaryHoverBackground'),
      '--vscode-textLink-foreground': getColorVar('textLink.foreground'),
      '--vscode-textLink-activeForeground': getColorVar('textLink.activeForeground'),
      '--vscode-focusBorder': getColorVar('focusBorder'),
      '--vscode-errorForeground': getColorVar('errorForeground'),
      '--vscode-warningForeground': getColorVar('warningForeground'),
      '--vscode-foreground': getColorVar('foreground'),
      '--vscode-descriptionForeground': getColorVar('descriptionForeground'),
      '--vscode-icon-foreground': getColorVar('icon.foreground'),
      '--vscode-panel-border': getColorVar('panel.border'),
      '--vscode-inputOption-hoverBorder': getColorVar('inputOption.hoverBorder'),
    },
  };
}
