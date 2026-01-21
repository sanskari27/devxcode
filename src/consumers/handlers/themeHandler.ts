import { getVSCodeTheme } from '../../services/theme';

export function handleThemeMessage(
  message: Record<string, unknown>,
  postMessage: (message: unknown) => void
) {
  switch (message.command) {
    case 'getTheme':
      postMessage({
        command: 'themeChanged',
        theme: getVSCodeTheme(),
      });
      return;
  }
}
