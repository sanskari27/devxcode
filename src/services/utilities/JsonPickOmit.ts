/**
 * Pick / omit fields tool
 * Selects or excludes specific fields from JSON
 * Note: This is a simplified version. Full implementation would require UI for field selection
 */
export const transform = (
  input: string,
  fields: string[] = [],
  mode: 'pick' | 'omit' = 'pick'
): string => {
  try {
    const parsed = JSON.parse(input);

    if (Array.isArray(parsed)) {
      const processed = parsed.map(item => processObject(item, fields, mode));
      return JSON.stringify(processed, null, 2);
    }

    if (typeof parsed === 'object' && parsed !== null) {
      const processed = processObject(parsed, fields, mode);
      return JSON.stringify(processed, null, 2);
    }

    return input;
  } catch (error) {
    throw new Error(
      `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

const processObject = (
  obj: any,
  fields: string[],
  mode: 'pick' | 'omit'
): any => {
  if (mode === 'pick') {
    const result: any = {};
    fields.forEach(field => {
      if (field in obj) {
        result[field] = obj[field];
      }
    });
    return result;
  } else {
    const result: any = {};
    Object.keys(obj).forEach(key => {
      if (!fields.includes(key)) {
        result[key] = obj[key];
      }
    });
    return result;
  }
};

export const reverse = (input: string): string => {
  // Pick/omit is not reversible, return original
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
