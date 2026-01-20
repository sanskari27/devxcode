/**
 * Case Converter tool
 * Converts between camelCase, snake_case, kebab-case, PascalCase, etc.
 */
const toCamelCase = (str: string): string => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '');
};

const toPascalCase = (str: string): string => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '');
};

const toSnakeCase = (str: string): string => {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
    .replace(/\s+/g, '_')
    .replace(/-/g, '_');
};

const toKebabCase = (str: string): string => {
  return str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '')
    .replace(/\s+/g, '-')
    .replace(/_/g, '-');
};

export const transform = (
  input: string,
  targetCase: 'camel' | 'pascal' | 'snake' | 'kebab' = 'camel'
): string => {
  switch (targetCase) {
    case 'camel':
      return toCamelCase(input);
    case 'pascal':
      return toPascalCase(input);
    case 'snake':
      return toSnakeCase(input);
    case 'kebab':
      return toKebabCase(input);
    default:
      return input;
  }
};

export const reverse = (input: string): string => {
  // Try to detect case and convert to opposite
  if (input.includes('_')) {
    // snake_case -> camelCase
    return toCamelCase(input);
  } else if (input.includes('-')) {
    // kebab-case -> camelCase
    return toCamelCase(input);
  } else if (
    input[0] === input[0]?.toUpperCase() &&
    input[0] !== input[0]?.toLowerCase()
  ) {
    // PascalCase -> camelCase
    return toCamelCase(input);
  } else {
    // camelCase -> snake_case
    return toSnakeCase(input);
  }
};

export const validate = (input: string): { valid: boolean; error?: string } => {
  return { valid: true };
};
