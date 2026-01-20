# DevXCode - VS Code Extension

A React-based VS Code extension built with TypeScript, Vite, Tailwind CSS, and following atomic design principles.

## What DevXCode Can Do

DevXCode is a comprehensive developer toolkit that provides essential tools and utilities directly in your VS Code sidebar. It includes:

### Core Features

1. **Todos** - Task management system to track and manage your to-do items with persistent storage.

2. **Repositories** - Automatically tracks your workspace repositories, allows you to manage multiple repositories, and quickly open them in new VS Code windows.

3. **GitHub Helpers** - Quick-access Git command helpers for common operations:
   - Interactive rebase operations
   - Commit amends (with/without editing)
   - Reset operations (soft/hard/mixed)
   - Branch management
   - Stash operations
   - And more...
   
   Commands execute in a dedicated terminal for easy execution.

4. **Utilities** - A comprehensive collection of 34+ developer utility tools organized into categories:
   - **JSON Tools**: Validator, formatter, pick/omit, sort keys, remove nulls, string converter
   - **Converters**: Base64, Hex, Bytes, Case conversion
   - **Date/Time**: Epoch converter, ISO formatter, time calculator, cron to human-readable, human to cron
   - **Text Tools**: Trim, normalize line endings, tabs/spaces converter, remove newlines
   - **Generators**: UUID, NanoID, random strings, slugs, random colors
   - **Analyzers**: JWT analyzer, curl parser
   - **Other**: URL converter, query params converter, HTTP headers formatter, file size formatter, JavaScript to JSON converter

5. **Releases** - Release management system with progress tracking and status checklists (handover completion, support stamping, security stamping).

6. **Dumps** - Save and manage text/content snippets that can be edited directly in VS Code editors. Changes are automatically synced back to the extension.

All features use VS Code's Memento API for persistent storage and automatically adapt to your VS Code theme.

## Project Structure

```
devxcode/
├── src/
│   ├── consumers/
│   │   └── extension.ts          # Main VS Code extension entry point
│   ├── webview/
│   │   ├── components/           # React components (atomic design)
│   │   │   ├── atoms/           # Smallest reusable components
│   │   │   ├── molecules/       # Combinations of atoms
│   │   │   └── organisms/       # Complex UI components
│   │   ├── App.tsx               # Main React app component
│   │   ├── main.tsx              # React entry point
│   │   ├── index.html            # Webview HTML template
│   │   └── index.css             # Global styles with Tailwind
│   └── services/
│       └── storage.ts            # Memento API wrapper for data storage
├── package.json                  # Extension manifest + dependencies
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts               # Vite bundler configuration
├── tailwind.config.js           # Tailwind CSS configuration
└── README.md                    # This file
```

## Technical Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe code
- **Vite** - Fast bundler for webview
- **Tailwind CSS** - Utility-first CSS framework
- **Atomic Design** - Component architecture (atoms → molecules → organisms)
- **ESLint & Prettier** - Code quality and formatting
- **VS Code Memento API** - Data persistence

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- VS Code (v1.74.0 or higher)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the extension:
```bash
npm run build
```

3. Open the project in VS Code and press `F5` to run the extension in a new Extension Development Host window.

## Development

### Watch Mode

Run the TypeScript compiler in watch mode:
```bash
npm run watch
```

In another terminal, run Vite in watch mode for the webview:
```bash
npm run webview:dev
```

### Linting and Formatting

Run ESLint:
```bash
npm run lint
```

Format code with Prettier:
```bash
npm run format
```

## Building

Build both the extension and webview:
```bash
npm run build
```

## Packaging

Create a VSIX package:
```bash
npm run package
```

## Usage

1. Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Run the command: `DevXCode: Open DevXCode Webview`
3. The webview panel will open with the React application

Alternatively, you can access DevXCode from the Activity Bar sidebar - look for the DevXCode icon in the left sidebar.

## Component Architecture

The project follows **Atomic Design** principles:

- **Atoms**: Basic building blocks (Button, Input, Label)
- **Molecules**: Simple combinations of atoms (Card, SearchBar, FormField)
- **Organisms**: Complex UI components (Header, MainContent)

## Data Storage

The extension uses VS Code's Memento API through the `StorageService`:

- `workspaceState`: Data scoped to the current workspace
- `globalState`: Data that persists across all workspaces

Example usage:
```typescript
const storage = new StorageService(context.workspaceState, context.globalState);
await storage.setWorkspaceValue('key', value);
const value = storage.getWorkspaceValue('key');
```

## License

MIT
