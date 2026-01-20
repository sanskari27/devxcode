/**
 * ISO string formatter tool
 * Formats and parses ISO date strings
 */
export const transform = (input: string): string => {
  try {
    const date = new Date(input);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return date.toISOString();
  } catch (error) {
    throw new Error(
      `ISO formatting failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const reverse = (input: string): string => {
  try {
    const date = new Date(input);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid ISO date');
    }
    // Return in a different format
    return date.toLocaleString();
  } catch (error) {
    throw new Error(
      `ISO parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const validate = (input: string): { valid: boolean; error?: string } => {
  try {
    const date = new Date(input);
    if (isNaN(date.getTime())) {
      return { valid: false, error: 'Invalid date' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid date format' };
  }
};
