/**
 * JSON ↔ String Converter tool
 * Converts between JSON and escaped string
 */
export const transform = (input: string, toString: boolean = true): string => {
  try {
    if (toString) {
      // Convert JSON to escaped string
      return JSON.stringify(input);
    } else {
      // Convert escaped string to JSON
      return JSON.parse(input);
    }
  } catch (error) {
    throw new Error(
      `Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const reverse = (input: string): string => {
  try {
    // Try to parse as JSON string first
    try {
      const parsed = JSON.parse(input);
      // If it's a string, convert it back to JSON
      if (typeof parsed === 'string') {
        return parsed;
      }
      // Otherwise, stringify it
      return JSON.stringify(parsed);
    } catch {
      // If parsing fails, treat as plain string and escape it
      return JSON.stringify(input);
    }
  } catch (error) {
    throw new Error(
      `Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const validate = (input: string): { valid: boolean; error?: string } => {
  // Always valid for string conversion
  return { valid: true };
};
