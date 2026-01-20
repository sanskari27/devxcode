/**
 * Remove null / undefined fields tool
 * Removes null and undefined values from JSON
 */
const removeNullsRecursive = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj
      .map(item => removeNullsRecursive(item))
      .filter(item => item !== null && item !== undefined);
  }
  if (obj !== null && typeof obj === 'object') {
    const cleaned: any = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value !== null && value !== undefined) {
        cleaned[key] = removeNullsRecursive(value);
      }
    });
    return cleaned;
  }
  return obj;
};

export const transform = (input: string): string => {
  try {
    const parsed = JSON.parse(input);
    const cleaned = removeNullsRecursive(parsed);
    return JSON.stringify(cleaned, null, 2);
  } catch (error) {
    throw new Error(
      `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const reverse = (input: string): string => {
  // Removing nulls is not reversible, return original
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
