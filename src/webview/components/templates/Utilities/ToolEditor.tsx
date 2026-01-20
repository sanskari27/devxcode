import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { TOOL_CONFIGS, ToolInputConfig } from '@services/utilities';
import { showNotification } from '@src/webview/utils/notifications';
import CodeMirror from '@uiw/react-codemirror';
import { Copy } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from '../../../hooks/useTheme';

declare const vscode: {
  postMessage: (message: unknown) => void;
  getState: () => any;
  setState: (state: any) => void;
};

interface ToolEditorProps {
  toolId: string;
  toolName: string;
  toolDescription: string;
  onTransform: (input: string, params?: Record<string, any>) => string;
}

export const ToolEditor: React.FC<ToolEditorProps> = ({
  toolId,
  toolName,
  toolDescription,
  onTransform,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [editorHeight, setEditorHeight] = useState(400);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  // Get tool configuration for additional inputs
  const toolConfig = TOOL_CONFIGS[toolId];

  // Load persisted state on mount
  const loadPersistedState = () => {
    try {
      if (typeof vscode !== 'undefined' && vscode.getState) {
        const state = vscode.getState();
        if (state && state[toolId]) {
          return state[toolId];
        }
      }
    } catch (error) {
      console.error('Failed to load persisted state:', error);
    }
    return null;
  };

  const persistedState = loadPersistedState();

  const [inputValue, setInputValue] = useState(
    persistedState?.inputValue || ''
  );
  const [outputValue, setOutputValue] = useState(
    persistedState?.outputValue || ''
  );
  const [additionalParams, setAdditionalParams] = useState<Record<string, any>>(
    () => {
      if (persistedState?.additionalParams) {
        return persistedState.additionalParams;
      }
      if (!toolConfig) return {};
      const params: Record<string, any> = {};
      toolConfig.inputs.forEach(input => {
        params[input.key] = input.defaultValue;
      });
      return params;
    }
  );

  // Determine if we should use JSON language or plain text based on tool type
  const useJsonLanguage = toolId.includes('json') || toolId.includes('jwt');

  // Calculate editor height based on available space
  useEffect(() => {
    const updateHeight = () => {
      if (editorContainerRef.current) {
        const container = editorContainerRef.current;
        const rect = container.getBoundingClientRect();
        // Subtract padding (p-4 = 1rem = 16px top and bottom = 32px) and label height (~20px)
        const availableHeight = rect.height - 32 - 20;
        setEditorHeight(Math.max(200, availableHeight));
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    // Use ResizeObserver for more accurate height tracking
    const resizeObserver = new ResizeObserver(updateHeight);
    if (editorContainerRef.current) {
      resizeObserver.observe(editorContainerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateHeight);
      resizeObserver.disconnect();
    };
  }, []);

  const transformInput = useCallback(() => {
    if (!inputValue) {
      setOutputValue('');
      setError(null);
      return;
    }

    try {
      // Convert string boolean values to actual booleans
      const processedParams = { ...additionalParams };
      Object.keys(processedParams).forEach(key => {
        if (processedParams[key] === 'true') processedParams[key] = true;
        if (processedParams[key] === 'false') processedParams[key] = false;
        // Handle fields array for json-pick-omit
        if (key === 'fields' && typeof processedParams[key] === 'string') {
          processedParams[key] = processedParams[key]
            .split(',')
            .map(f => f.trim())
            .filter(f => f.length > 0);
        }
      });

      const output = onTransform(
        inputValue,
        Object.keys(processedParams).length > 0 ? processedParams : undefined
      );
      setOutputValue(output);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Transformation failed';
      setError(errorMessage);
      setOutputValue(`Error: ${errorMessage}`);
    }
  }, [inputValue, additionalParams, onTransform]);

  // Save state to vscode storage whenever it changes
  useEffect(() => {
    const saveState = () => {
      try {
        if (typeof vscode !== 'undefined' && vscode.setState) {
          const currentState = vscode.getState() || {};
          vscode.setState({
            ...currentState,
            [toolId]: {
              inputValue,
              outputValue,
              additionalParams,
            },
          });
        }
      } catch (error) {
        console.error('Failed to save state:', error);
      }
    };

    // Debounce state saving to avoid too many writes
    const timeoutId = setTimeout(saveState, 500);

    return () => clearTimeout(timeoutId);
  }, [inputValue, outputValue, additionalParams, toolId]);

  // Transform input when it or params change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      transformInput();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue, additionalParams, transformInput]);

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleParamChange = (key: string, value: any) => {
    setAdditionalParams(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCopy = useCallback(
    async (text: string, type: 'input' | 'output') => {
      try {
        await navigator.clipboard.writeText(text);
        showNotification(
          `${type === 'input' ? 'Input' : 'Output'} copied to clipboard`,
          'success'
        );
      } catch (err) {
        showNotification('Failed to copy to clipboard', 'error');
      }
    },
    []
  );

  const renderInputField = (input: ToolInputConfig) => {
    const value = additionalParams[input.key] ?? input.defaultValue;

    switch (input.type) {
      case 'text':
        return (
          <div key={input.key} className="flex flex-col min-w-[200px]">
            <label className="block text-xs text-[var(--vscode-descriptionForeground)] mb-1">
              {input.label}
            </label>
            <input
              type="text"
              value={value || ''}
              onChange={e => handleParamChange(input.key, e.target.value)}
              placeholder={input.placeholder}
              className="px-2 py-1.5 text-sm bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] border border-[var(--vscode-input-border)] rounded"
            />
            {input.description && (
              <p className="text-xs text-[var(--vscode-descriptionForeground)] mt-1">
                {input.description}
              </p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={input.key} className="flex flex-col min-w-[250px]">
            <label className="block text-xs text-[var(--vscode-descriptionForeground)] mb-1">
              {input.label}
            </label>
            <textarea
              value={value || ''}
              onChange={e => handleParamChange(input.key, e.target.value)}
              placeholder={input.placeholder}
              rows={3}
              className="px-2 py-1.5 text-sm bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] border border-[var(--vscode-input-border)] rounded resize-none"
            />
            {input.description && (
              <p className="text-xs text-[var(--vscode-descriptionForeground)] mt-1">
                {input.description}
              </p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={input.key} className="flex flex-col min-w-[150px]">
            <label className="block text-xs text-[var(--vscode-descriptionForeground)] mb-1">
              {input.label}
            </label>
            <input
              type="number"
              value={value ?? input.defaultValue ?? ''}
              onChange={e =>
                handleParamChange(input.key, parseInt(e.target.value, 10))
              }
              min={input.min}
              max={input.max}
              step={input.step}
              className="px-2 py-1.5 text-sm bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] border border-[var(--vscode-input-border)] rounded"
            />
            {input.description && (
              <p className="text-xs text-[var(--vscode-descriptionForeground)] mt-1">
                {input.description}
              </p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={input.key} className="flex flex-col min-w-[180px]">
            <label className="block text-xs text-[var(--vscode-descriptionForeground)] mb-1">
              {input.label}
            </label>
            <select
              value={value ?? input.defaultValue ?? ''}
              onChange={e => handleParamChange(input.key, e.target.value)}
              className="px-2 py-1.5 text-sm bg-[var(--vscode-dropdown-background)] text-[var(--vscode-dropdown-foreground)] border border-[var(--vscode-dropdown-border)] rounded"
            >
              {input.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {input.description && (
              <p className="text-xs text-[var(--vscode-descriptionForeground)] mt-1">
                {input.description}
              </p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={input.key} className="flex flex-col min-w-[200px]">
            <label className="flex items-center gap-2 cursor-pointer mb-1">
              <input
                type="checkbox"
                checked={value ?? input.defaultValue ?? false}
                onChange={e => handleParamChange(input.key, e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-xs text-[var(--vscode-descriptionForeground)]">
                {input.label}
              </span>
            </label>
            {input.description && (
              <p className="text-xs text-[var(--vscode-descriptionForeground)] mt-1 ml-6">
                {input.description}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="p-4 border-b border-[var(--vscode-menu-border)]">
        <div className="flex flex-row justify-between gap-3 mb-3">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-[var(--vscode-foreground)]">
              {toolName}
            </h2>
            <p className="text-sm text-[var(--vscode-descriptionForeground)] mt-1">
              {toolDescription}
            </p>
          </div>
          <div className="flex-1">
            {toolConfig && toolConfig.inputs.length > 0 && (
              <div className="flex flex-col gap-3">
                {toolConfig.inputs.map(input => renderInputField(input))}
              </div>
            )}
          </div>
        </div>
        {error && (
          <div className="mt-2 text-sm text-[var(--vscode-errorForeground)]">
            {error}
          </div>
        )}
      </div>

      {/* Editors */}
      <div
        ref={editorContainerRef}
        className="grid grid-cols-2 gap-4 p-4 flex-1 overflow-hidden"
        style={{ minHeight: 0 }}
      >
        <div className="flex flex-col min-h-0 h-full">
          <div className="text-xs text-[var(--vscode-descriptionForeground)] mb-2 flex-shrink-0">
            Input
          </div>
          <div
            className="flex-1 border border-[var(--vscode-menu-border)] overflow-hidden relative"
            style={{ minHeight: 0 }}
          >
            <button
              onClick={() => handleCopy(inputValue, 'input')}
              className="absolute top-2 right-2 z-10 p-1.5 rounded cursor-pointer bg-[var(--vscode-button-secondaryBackground)] hover:bg-[var(--vscode-button-background)] transition-colors flex items-center justify-center"
              title="Copy input"
            >
              <Copy className="h-4 w-4 text-[var(--vscode-icon-foreground)]" />
            </button>
            <CodeMirror
              value={inputValue}
              height={`${editorHeight}px`}
              extensions={useJsonLanguage ? [json()] : []}
              theme={oneDark}
              onChange={handleInputChange}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                dropCursor: false,
                allowMultipleSelections: false,
              }}
            />
          </div>
        </div>
        <div className="flex flex-col min-h-0 h-full">
          <div className="text-xs text-[var(--vscode-descriptionForeground)] mb-2 flex-shrink-0">
            Output
          </div>
          <div
            className="flex-1 border border-[var(--vscode-menu-border)] overflow-hidden relative"
            style={{ minHeight: 0 }}
          >
            <button
              onClick={() => handleCopy(outputValue, 'output')}
              className="absolute top-2 right-2 z-10 p-1.5 rounded cursor-pointer bg-[var(--vscode-button-secondaryBackground)] hover:bg-[var(--vscode-button-background)] transition-colors flex items-center justify-center"
              title="Copy output"
            >
              <Copy className="h-4 w-4 text-[var(--vscode-icon-foreground)]" />
            </button>
            <CodeMirror
              value={outputValue}
              height={`${editorHeight}px`}
              extensions={useJsonLanguage ? [json()] : []}
              theme={oneDark}
              editable={true}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                dropCursor: false,
                allowMultipleSelections: false,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
