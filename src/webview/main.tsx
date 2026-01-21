import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Backmerge } from './components/templates/Backmerge';
import { ToolEditorManager } from './components/templates/Utilities/ToolEditorManager';
import './index.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);

// Check if we're in a backmerge webview
const backmergeView = (window as any).backmergeView;

// Check if we're in a tool editor webview
const toolId = (window as any).toolId;

if (backmergeView) {
  // Render backmerge view
  root.render(
    <React.StrictMode>
      <Backmerge />
    </React.StrictMode>
  );
} else if (toolId) {
  // Render tool editor
  root.render(
    <React.StrictMode>
      <ToolEditorManager toolId={toolId} />
    </React.StrictMode>
  );
} else {
  // Render main app
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
