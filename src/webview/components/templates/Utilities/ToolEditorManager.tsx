import { UtilitiesService } from '@services/utilities';
import React, { useEffect, useState } from 'react';
import { ToolEditor } from './ToolEditor';
interface ToolEditorManagerProps {
  toolId: string;
}

// Tool service mapping
const TOOL_SERVICE_MAP: Record<string, any> = {
  'json-pretty-minify': () =>
    import('@services/utilities').then(m => m.JsonPrettyMinify),
  'json-validator': () =>
    import('@services/utilities').then(m => m.JsonValidator),
  'json-sort-keys': () =>
    import('@services/utilities').then(m => m.JsonSortKeys),
  'json-remove-nulls': () =>
    import('@services/utilities').then(m => m.JsonRemoveNulls),
  'json-pick-omit': () =>
    import('@services/utilities').then(m => m.JsonPickOmit),
  'json-string-converter': () =>
    import('@services/utilities').then(m => m.JsonStringConverter),
  'javascript-to-json': () =>
    import('@services/utilities').then(m => m.JavascriptToJson),
  'jwt-analyzer': () => import('@services/utilities').then(m => m.JwtAnalyzer),
  'base64-converter': () =>
    import('@services/utilities').then(m => m.Base64Converter),
  'url-converter': () =>
    import('@services/utilities').then(m => m.UrlConverter),
  'hex-converter': () =>
    import('@services/utilities').then(m => m.HexConverter),
  'epoch-date-converter': () =>
    import('@services/utilities').then(m => m.EpochDateConverter),
  'now-converter': () =>
    import('@services/utilities').then(m => m.NowConverter),
  'time-calculator': () =>
    import('@services/utilities').then(m => m.TimeCalculator),
  'iso-formatter': () =>
    import('@services/utilities').then(m => m.IsoFormatter),
  'cron-to-human': () => import('@services/utilities').then(m => m.CronToHuman),
  'text-trim': () => import('@services/utilities').then(m => m.TextTrim),
  'text-remove-newlines': () =>
    import('@services/utilities').then(m => m.TextRemoveNewlines),
  'text-normalize-line-endings': () =>
    import('@services/utilities').then(m => m.TextNormalizeLineEndings),
  'text-tabs-spaces': () =>
    import('@services/utilities').then(m => m.TextTabsSpaces),
  'slug-generator': () =>
    import('@services/utilities').then(m => m.SlugGenerator),
  'random-string': () =>
    import('@services/utilities').then(m => m.RandomString),
  'case-converter': () =>
    import('@services/utilities').then(m => m.CaseConverter),
  'curl-parser': () => import('@services/utilities').then(m => m.CurlParser),
  'http-headers-formatter': () =>
    import('@services/utilities').then(m => m.HttpHeadersFormatter),
  'query-params-converter': () =>
    import('@services/utilities').then(m => m.QueryParamsConverter),
  'uuid-generator': () =>
    import('@services/utilities').then(m => m.UuidGenerator),
  'nanoid-generator': () =>
    import('@services/utilities').then(m => m.NanoIdGenerator),
  'random-color': () => import('@services/utilities').then(m => m.RandomColor),
  'file-size-formatter': () =>
    import('@services/utilities').then(m => m.FileSizeFormatter),
  'bytes-converter': () =>
    import('@services/utilities').then(m => m.BytesConverter),
};

export const ToolEditorManager: React.FC<ToolEditorManagerProps> = ({
  toolId,
}) => {
  const [toolService, setToolService] = useState<any>(null);
  const [toolInfo, setToolInfo] = useState<{
    name: string;
    description: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTool = async () => {
      try {
        const service = new UtilitiesService();
        const tool = service.getToolById(toolId);

        if (!tool) {
          throw new Error(`Tool with id ${toolId} not found`);
        }

        setToolInfo({
          name: tool.name,
          description: tool.description,
        });

        // Load tool service
        const loadService = TOOL_SERVICE_MAP[toolId];
        if (!loadService) {
          throw new Error(`No service found for tool ${toolId}`);
        }

        const serviceModule = await loadService();
        // Service modules are exported as namespaces, so we use them directly
        setToolService(serviceModule);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load tool:', error);
        setLoading(false);
      }
    };

    loadTool();
  }, [toolId]);

  if (loading || !toolService || !toolInfo) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[var(--vscode-foreground)]">Loading tool...</div>
      </div>
    );
  }

  const handleTransform = (
    input: string,
    params?: Record<string, any>
  ): string => {
    if (toolService && toolService.transform) {
      if (!params) {
        return toolService.transform(input);
      }

      // Map parameters based on tool ID to match the transform function signature
      switch (toolId) {
        case 'json-pick-omit':
          return toolService.transform(
            input,
            params.fields || [],
            params.mode || 'pick'
          );

        case 'json-pretty-minify':
          return toolService.transform(
            input,
            params.isPretty === 'true' || params.isPretty === true
          );

        case 'query-params-converter':
          return toolService.transform(
            input,
            params.toObject === 'true' || params.toObject === true
          );

        case 'case-converter':
          return toolService.transform(input, params.targetCase || 'camel');

        case 'random-string':
          return toolService.transform(
            input,
            params.length || 16,
            params.includeSpecial || false
          );

        case 'now-converter':
          return toolService.transform(input, params.timezone || 'UTC');

        case 'epoch-date-converter':
          return toolService.transform(
            input,
            params.toDate === 'true' || params.toDate === true
          );

        case 'base64-converter':
        case 'url-converter':
        case 'hex-converter':
          return toolService.transform(
            input,
            params.encode === 'true' || params.encode === true
          );

        case 'json-string-converter':
          return toolService.transform(
            input,
            params['toString'] === 'true' || params['toString'] === true
          );

        case 'nanoid-generator':
          return toolService.transform(input, params.size || 21);

        case 'random-color':
          return toolService.transform(input, params.format || 'hex');

        case 'text-normalize-line-endings':
          return toolService.transform(input, params.target || 'lf');

        case 'text-tabs-spaces':
          return toolService.transform(
            input,
            params.toSpaces === 'true' || params.toSpaces === true,
            params.spacesPerTab || 2
          );

        case 'bytes-converter':
          return toolService.transform(
            input,
            params.fromUnit || 'bytes',
            params.toUnit || 'kb'
          );

        case 'time-calculator':
          return toolService.transform(input, params.baseTime || undefined);

        case 'javascript-to-json':
          // This tool uses separate transform/reverse functions
          if (params.direction === 'toJs') {
            return toolService.reverse
              ? toolService.reverse(input)
              : toolService.transform(input);
          }
          return toolService.transform(input);

        case 'iso-formatter':
          // This tool uses separate transform/reverse functions
          if (params.direction === 'toLocale') {
            return toolService.reverse
              ? toolService.reverse(input)
              : toolService.transform(input);
          }
          return toolService.transform(input);

        default: {
          // Fallback: try to pass parameters in order
          const paramValues = Object.values(params);
          if (paramValues.length === 1) {
            return toolService.transform(input, paramValues[0]);
          } else if (paramValues.length === 2) {
            return toolService.transform(input, paramValues[0], paramValues[1]);
          } else if (paramValues.length === 3) {
            return toolService.transform(
              input,
              paramValues[0],
              paramValues[1],
              paramValues[2]
            );
          }
          return toolService.transform(input);
        }
      }
    }
    return input;
  };

  return (
    <ToolEditor
      toolId={toolId}
      toolName={toolInfo.name}
      toolDescription={toolInfo.description}
      onTransform={handleTransform}
    />
  );
};
