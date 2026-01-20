/**
 * JSON Validator tool
 * Validates JSON and shows error line
 */
export const transform = (input: string): string => {
  try {
    const parsed = JSON.parse(input);
    return JSON.stringify(parsed, null, 2);
  } catch (error) {
    throw new Error(
      `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const reverse = (input: string): string => {
  // Validator is not reversible, return as-is
  return input;
};

export const validate = (
  input: string
): { valid: boolean; error?: string; line?: number } => {
  try {
    JSON.parse(input);
    return { valid: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Invalid JSON';
    // Try to extract line number from error message
    const lineMatch = errorMessage.match(/position (\d+)/);
    const position = lineMatch ? parseInt(lineMatch[1], 10) : undefined;
    const line = position ? Math.floor(position / 80) + 1 : undefined; // Rough estimate

    return {
      valid: false,
      error: errorMessage,
      line,
    };
  }
};
