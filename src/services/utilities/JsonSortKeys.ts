/**
 * Sort JSON Keys tool
 * Sorts JSON object keys alphabetically
 */
const sortKeysRecursive = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(item => sortKeysRecursive(item));
  }
  if (obj !== null && typeof obj === 'object') {
    const sorted: any = {};
    Object.keys(obj)
      .sort()
      .forEach(key => {
        sorted[key] = sortKeysRecursive(obj[key]);
      });
    return sorted;
  }
  return obj;
};

export const transform = (input: string): string => {
  try {
    const parsed = JSON.parse(input);
    const sorted = sortKeysRecursive(parsed);
    return JSON.stringify(sorted, null, 2);
  } catch (error) {
    throw new Error(
      `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const reverse = (input: string): string => {
  // Sorting is not reversible, return original
  return input;
};

export const validate = (input: string): { valid: boolean; error?: string } => {
  try {
    JSON.parse(input);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid JSON',
    };
  }
};
