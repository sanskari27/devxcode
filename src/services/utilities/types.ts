import {
  AlignLeft,
  ArrowLeftRight,
  ArrowUpDown,
  CaseSensitive,
  CheckCircle,
  Clock,
  Code,
  Database,
  Droplet,
  FileCode,
  FileJson,
  Filter,
  Fingerprint,
  HardDrive,
  Hash,
  IdCard,
  Key,
  Link,
  Lock,
  Maximize2,
  Minimize2,
  Network,
  Palette,
  Repeat,
  Search,
  ShieldCheck,
  Type,
  Wrench,
} from 'lucide-react';

/**
 * Tool interface
 * Represents a single utility tool
 */
export interface Tool {
  id: string;
  name: string;
  icon: string;
  description: string;
  component: string;
}

/**
 * Tool Group interface
 * Represents a group of related tools
 */
export interface ToolGroup {
  id: string;
  name: string;
  icon: string;
  description: string;
  tools: Tool[];
}

/**
 * Tool input field configuration
 */
export type ToolInputType =
  | 'text'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'multiselect'
  | 'textarea';

export interface ToolInputConfig {
  key: string;
  label: string;
  type: ToolInputType;
  defaultValue?: any;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}

/**
 * Tool configuration for additional inputs
 */
export interface ToolConfig {
  toolId: string;
  inputs: ToolInputConfig[];
}

/**
 * Icon mapping for tool groups and tools
 */
export const TOOL_ICONS: Record<string, any> = {
  fileJson: FileJson,
  key: Key,
  lock: Lock,
  clock: Clock,
  type: Type,
  caseSensitive: CaseSensitive,
  network: Network,
  wrench: Wrench,
  code: Code,
  alignLeft: AlignLeft,
  maximize2: Maximize2,
  minimize2: Minimize2,
  checkCircle: CheckCircle,
  shieldCheck: ShieldCheck,
  arrowUpDown: ArrowUpDown,
  filter: Filter,
  arrowLeftRight: ArrowLeftRight,
  repeat: Repeat,
  fileCode: FileCode,
  hash: Hash,
  link: Link,
  fingerprint: Fingerprint,
  idCard: IdCard,
  palette: Palette,
  droplet: Droplet,
  hardDrive: HardDrive,
  database: Database,
  search: Search,
};

/**
 * All tool groups with their tools
 */
export const TOOL_GROUPS: ToolGroup[] = [
  {
    id: 'json',
    name: 'JSON Tools',
    icon: 'fileJson',
    description: 'JSON manipulation and validation tools',
    tools: [
      {
        id: 'json-pretty-minify',
        name: 'Pretty Print / Minify JSON',
        icon: 'alignLeft',
        description: 'Format JSON with indentation or remove whitespace',
        component: 'JsonPrettyMinify',
      },
      {
        id: 'json-validator',
        name: 'JSON Validator',
        icon: 'shieldCheck',
        description: 'Validate JSON and show error line',
        component: 'JsonValidator',
      },
      {
        id: 'json-sort-keys',
        name: 'Sort JSON Keys',
        icon: 'arrowUpDown',
        description: 'Sort JSON object keys alphabetically',
        component: 'JsonSortKeys',
      },
      {
        id: 'json-remove-nulls',
        name: 'Remove null / undefined fields',
        icon: 'filter',
        description: 'Remove null and undefined values from JSON',
        component: 'JsonRemoveNulls',
      },
      {
        id: 'json-pick-omit',
        name: 'Pick / omit fields',
        icon: 'filter',
        description: 'Select or exclude specific fields from JSON',
        component: 'JsonPickOmit',
      },
      {
        id: 'json-string-converter',
        name: 'JSON ↔ String Converter',
        icon: 'arrowLeftRight',
        description: 'Convert between JSON and escaped string',
        component: 'JsonStringConverter',
      },
      {
        id: 'javascript-to-json',
        name: 'JavaScript to JSON object',
        icon: 'fileCode',
        description: 'Convert JavaScript object literal to JSON',
        component: 'JavascriptToJson',
      },
    ],
  },
  {
    id: 'jwt',
    name: 'JWT Tools',
    icon: 'key',
    description: 'JWT token manipulation and analysis',
    tools: [
      {
        id: 'jwt-analyzer',
        name: 'JWT Analyzer',
        icon: 'key',
        description: 'Decode JWT, check expiry, and show issued-at time',
        component: 'JwtAnalyzer',
      },
    ],
  },
  {
    id: 'encoding',
    name: 'Encoding',
    icon: 'lock',
    description: 'Text encoding and decoding utilities',
    tools: [
      {
        id: 'base64-converter',
        name: 'Base64 Encode / Decode',
        icon: 'hash',
        description: 'Encode text to Base64 or decode Base64 to text',
        component: 'Base64Converter',
      },
      {
        id: 'url-converter',
        name: 'URL Encode / Decode',
        icon: 'link',
        description: 'Encode text for URL or decode URL encoded text',
        component: 'UrlConverter',
      },
      {
        id: 'hex-converter',
        name: 'Hex Encode / Decode',
        icon: 'hash',
        description: 'Encode text to hexadecimal or decode hexadecimal to text',
        component: 'HexConverter',
      },
    ],
  },
  {
    id: 'time',
    name: 'Time Tools',
    icon: 'clock',
    description: 'Time and date conversion utilities',
    tools: [
      {
        id: 'epoch-date-converter',
        name: 'Epoch ↔ Date Converter',
        icon: 'clock',
        description: 'Convert between Unix timestamp and readable date',
        component: 'EpochDateConverter',
      },
      {
        id: 'now-converter',
        name: 'Now → UTC / IST / Custom TZ',
        icon: 'clock',
        description: 'Convert current time to different timezones',
        component: 'NowConverter',
      },
      {
        id: 'time-calculator',
        name: 'Add / subtract time',
        icon: 'clock',
        description: 'Calculate time with offsets (e.g., now + 2h 15m)',
        component: 'TimeCalculator',
      },
      {
        id: 'iso-formatter',
        name: 'ISO string formatter',
        icon: 'clock',
        description: 'Format and parse ISO date strings',
        component: 'IsoFormatter',
      },
      {
        id: 'cron-to-human',
        name: 'Cron expression → human text',
        icon: 'clock',
        description: 'Convert cron expression to human readable',
        component: 'CronToHuman',
      },
    ],
  },
  {
    id: 'text',
    name: 'Text Helpers',
    icon: 'type',
    description: 'Text manipulation and formatting tools',
    tools: [
      {
        id: 'text-trim',
        name: 'Trim whitespace',
        icon: 'type',
        description: 'Remove leading and trailing whitespace',
        component: 'TextTrim',
      },
      {
        id: 'text-remove-newlines',
        name: 'Remove newlines',
        icon: 'type',
        description: 'Remove all newline characters',
        component: 'TextRemoveNewlines',
      },
      {
        id: 'text-normalize-line-endings',
        name: 'Normalize line endings',
        icon: 'type',
        description: 'Convert line endings to consistent format',
        component: 'TextNormalizeLineEndings',
      },
      {
        id: 'text-tabs-spaces',
        name: 'Convert tabs ↔ spaces',
        icon: 'type',
        description: 'Convert between tabs and spaces',
        component: 'TextTabsSpaces',
      },
      {
        id: 'slug-generator',
        name: 'Slug generator',
        icon: 'type',
        description: 'Generate URL-friendly slugs from text',
        component: 'SlugGenerator',
      },
      {
        id: 'random-string',
        name: 'Random string generator',
        icon: 'type',
        description: 'Generate random strings',
        component: 'RandomString',
      },
    ],
  },
  {
    id: 'case',
    name: 'Case Conversion',
    icon: 'caseSensitive',
    description: 'Convert text between different case styles',
    tools: [
      {
        id: 'case-converter',
        name: 'Case Converter',
        icon: 'caseSensitive',
        description:
          'Convert between camelCase, snake_case, kebab-case, PascalCase, etc.',
        component: 'CaseConverter',
      },
    ],
  },
  {
    id: 'http',
    name: 'HTTP / Network Utilities',
    icon: 'network',
    description: 'HTTP headers, requests, and network utilities',
    tools: [
      {
        id: 'curl-parser',
        name: 'Curl Parser',
        icon: 'network',
        description:
          'Parse curl commands and extract method, URL, headers, authorization, body, and more',
        component: 'CurlParser',
      },
      {
        id: 'http-headers-formatter',
        name: 'Format HTTP headers',
        icon: 'network',
        description: 'Format and prettify HTTP headers',
        component: 'HttpHeadersFormatter',
      },
      {
        id: 'query-params-converter',
        name: 'Query Params ↔ Object Converter',
        icon: 'search',
        description: 'Convert between query string and object',
        component: 'QueryParamsConverter',
      },
    ],
  },
  {
    id: 'misc',
    name: 'Misc Tools',
    icon: 'wrench',
    description: 'Miscellaneous utility tools',
    tools: [
      {
        id: 'uuid-generator',
        name: 'UUID v4 generator',
        icon: 'fingerprint',
        description: 'Generate UUID v4',
        component: 'UuidGenerator',
      },
      {
        id: 'nanoid-generator',
        name: 'NanoID generator',
        icon: 'idCard',
        description: 'Generate NanoID',
        component: 'NanoIdGenerator',
      },
      {
        id: 'random-color',
        name: 'Random color',
        icon: 'palette',
        description: 'Generate random colors (hex / rgb)',
        component: 'RandomColor',
      },
      {
        id: 'file-size-formatter',
        name: 'File size formatter',
        icon: 'hardDrive',
        description: 'Format file sizes',
        component: 'FileSizeFormatter',
      },
      {
        id: 'bytes-converter',
        name: 'Bytes ↔ KB / MB / GB',
        icon: 'database',
        description: 'Convert between bytes and units',
        component: 'BytesConverter',
      },
    ],
  },
];

/**
 * Configuration for tools that require additional inputs
 */
export const TOOL_CONFIGS: Record<string, ToolConfig> = {
  'json-pick-omit': {
    toolId: 'json-pick-omit',
    inputs: [
      {
        key: 'mode',
        label: 'Mode',
        type: 'select',
        defaultValue: 'pick',
        options: [
          { value: 'pick', label: 'Pick (include only selected fields)' },
          { value: 'omit', label: 'Omit (exclude selected fields)' },
        ],
      },
      {
        key: 'fields',
        label: 'Fields (comma-separated)',
        type: 'textarea',
        defaultValue: '',
        placeholder: 'field1, field2, field3',
        description: 'Enter field names separated by commas',
      },
    ],
  },
  'json-pretty-minify': {
    toolId: 'json-pretty-minify',
    inputs: [
      {
        key: 'isPretty',
        label: 'Format',
        type: 'select',
        defaultValue: 'true',
        options: [
          { value: 'true', label: 'Pretty Print' },
          { value: 'false', label: 'Minify' },
        ],
      },
    ],
  },
  'query-params-converter': {
    toolId: 'query-params-converter',
    inputs: [
      {
        key: 'toObject',
        label: 'Direction',
        type: 'select',
        defaultValue: 'true',
        options: [
          { value: 'true', label: 'Query String → Object' },
          { value: 'false', label: 'Object → Query String' },
        ],
      },
    ],
  },
  'case-converter': {
    toolId: 'case-converter',
    inputs: [
      {
        key: 'targetCase',
        label: 'Target Case',
        type: 'select',
        defaultValue: 'camel',
        options: [
          { value: 'camel', label: 'camelCase' },
          { value: 'pascal', label: 'PascalCase' },
          { value: 'snake', label: 'snake_case' },
          { value: 'kebab', label: 'kebab-case' },
        ],
      },
    ],
  },
  'random-string': {
    toolId: 'random-string',
    inputs: [
      {
        key: 'length',
        label: 'Length',
        type: 'number',
        defaultValue: 16,
        min: 1,
        max: 1000,
      },
      {
        key: 'includeSpecial',
        label: 'Include Special Characters',
        type: 'checkbox',
        defaultValue: false,
      },
    ],
  },
  'now-converter': {
    toolId: 'now-converter',
    inputs: [
      {
        key: 'timezone',
        label: 'Timezone',
        type: 'text',
        defaultValue: 'UTC',
        placeholder: 'UTC, IST, America/New_York, etc.',
      },
    ],
  },
  'epoch-date-converter': {
    toolId: 'epoch-date-converter',
    inputs: [
      {
        key: 'toDate',
        label: 'Direction',
        type: 'select',
        defaultValue: 'true',
        options: [
          { value: 'true', label: 'Epoch → Date' },
          { value: 'false', label: 'Date → Epoch' },
        ],
      },
    ],
  },
  'base64-converter': {
    toolId: 'base64-converter',
    inputs: [
      {
        key: 'encode',
        label: 'Direction',
        type: 'select',
        defaultValue: 'true',
        options: [
          { value: 'true', label: 'Encode' },
          { value: 'false', label: 'Decode' },
        ],
      },
    ],
  },
  'url-converter': {
    toolId: 'url-converter',
    inputs: [
      {
        key: 'encode',
        label: 'Direction',
        type: 'select',
        defaultValue: 'true',
        options: [
          { value: 'true', label: 'Encode' },
          { value: 'false', label: 'Decode' },
        ],
      },
    ],
  },
  'hex-converter': {
    toolId: 'hex-converter',
    inputs: [
      {
        key: 'encode',
        label: 'Direction',
        type: 'select',
        defaultValue: 'true',
        options: [
          { value: 'true', label: 'Encode' },
          { value: 'false', label: 'Decode' },
        ],
      },
    ],
  },
  'json-string-converter': {
    toolId: 'json-string-converter',
    inputs: [
      {
        key: 'toString',
        label: 'Direction',
        type: 'select',
        defaultValue: 'true',
        options: [
          { value: 'true', label: 'JSON → String' },
          { value: 'false', label: 'String → JSON' },
        ],
      },
    ],
  },
  'nanoid-generator': {
    toolId: 'nanoid-generator',
    inputs: [
      {
        key: 'size',
        label: 'Size',
        type: 'number',
        defaultValue: 21,
        min: 1,
        max: 100,
      },
    ],
  },
  'random-color': {
    toolId: 'random-color',
    inputs: [
      {
        key: 'format',
        label: 'Format',
        type: 'select',
        defaultValue: 'hex',
        options: [
          { value: 'hex', label: 'Hex (#RRGGBB)' },
          { value: 'rgb', label: 'RGB (r, g, b)' },
        ],
      },
    ],
  },
  'text-normalize-line-endings': {
    toolId: 'text-normalize-line-endings',
    inputs: [
      {
        key: 'target',
        label: 'Target Line Ending',
        type: 'select',
        defaultValue: 'lf',
        options: [
          { value: 'lf', label: 'LF (Unix/Linux)' },
          { value: 'crlf', label: 'CRLF (Windows)' },
          { value: 'cr', label: 'CR (Old Mac)' },
        ],
      },
    ],
  },
  'text-tabs-spaces': {
    toolId: 'text-tabs-spaces',
    inputs: [
      {
        key: 'toSpaces',
        label: 'Direction',
        type: 'select',
        defaultValue: 'true',
        options: [
          { value: 'true', label: 'Tabs → Spaces' },
          { value: 'false', label: 'Spaces → Tabs' },
        ],
      },
      {
        key: 'spacesPerTab',
        label: 'Spaces per Tab',
        type: 'number',
        defaultValue: 2,
        min: 1,
        max: 8,
      },
    ],
  },
  'bytes-converter': {
    toolId: 'bytes-converter',
    inputs: [
      {
        key: 'fromUnit',
        label: 'From Unit',
        type: 'select',
        defaultValue: 'bytes',
        options: [
          { value: 'bytes', label: 'Bytes' },
          { value: 'kb', label: 'KB' },
          { value: 'mb', label: 'MB' },
          { value: 'gb', label: 'GB' },
        ],
      },
      {
        key: 'toUnit',
        label: 'To Unit',
        type: 'select',
        defaultValue: 'kb',
        options: [
          { value: 'bytes', label: 'Bytes' },
          { value: 'kb', label: 'KB' },
          { value: 'mb', label: 'MB' },
          { value: 'gb', label: 'GB' },
        ],
      },
    ],
  },
  'time-calculator': {
    toolId: 'time-calculator',
    inputs: [
      {
        key: 'baseTime',
        label: 'Base Time (optional)',
        type: 'text',
        defaultValue: '',
        placeholder: 'ISO string or leave empty for now',
        description: 'Leave empty to use current time',
      },
    ],
  },
  'javascript-to-json': {
    toolId: 'javascript-to-json',
    inputs: [
      {
        key: 'direction',
        label: 'Direction',
        type: 'select',
        defaultValue: 'toJson',
        options: [
          { value: 'toJson', label: 'JavaScript → JSON' },
          { value: 'toJs', label: 'JSON → JavaScript' },
        ],
      },
    ],
  },
  'iso-formatter': {
    toolId: 'iso-formatter',
    inputs: [
      {
        key: 'direction',
        label: 'Direction',
        type: 'select',
        defaultValue: 'toIso',
        options: [
          { value: 'toIso', label: 'To ISO' },
          { value: 'toLocale', label: 'To Locale String' },
        ],
      },
    ],
  },
  'json-validator': {
    toolId: 'json-validator',
    inputs: [],
  },
  'json-sort-keys': {
    toolId: 'json-sort-keys',
    inputs: [],
  },
  'json-remove-nulls': {
    toolId: 'json-remove-nulls',
    inputs: [],
  },
  'jwt-analyzer': {
    toolId: 'jwt-analyzer',
    inputs: [],
  },
  'cron-to-human': {
    toolId: 'cron-to-human',
    inputs: [],
  },
  'text-trim': {
    toolId: 'text-trim',
    inputs: [],
  },
  'text-remove-newlines': {
    toolId: 'text-remove-newlines',
    inputs: [],
  },
  'slug-generator': {
    toolId: 'slug-generator',
    inputs: [],
  },
  'curl-parser': {
    toolId: 'curl-parser',
    inputs: [],
  },
  'http-headers-formatter': {
    toolId: 'http-headers-formatter',
    inputs: [],
  },
  'uuid-generator': {
    toolId: 'uuid-generator',
    inputs: [],
  },
  'file-size-formatter': {
    toolId: 'file-size-formatter',
    inputs: [],
  },
};
