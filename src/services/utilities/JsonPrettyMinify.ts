/**
 * Pretty Print / Minify JSON tool
 * Formats JSON with indentation or removes whitespace
 */
export const transform = (input: string, isPretty: boolean = true): string => {
  try {
    const parsed = JSON.parse(input);
    if (isPretty) {
      return JSON.stringify(parsed, null, 2);
    } else {
      return JSON.stringify(parsed);
    }
  } catch (error) {
    throw new Error(
      `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const reverse = (input: string): string => {
  try {
    JSON.parse(input);
    // If input is already minified (no spaces), pretty print it
    // If input is pretty printed, minify it
    const isPretty = input.includes('\n') || input.includes('  ');
    return transform(input, !isPretty);
  } catch (error) {
    throw new Error(
      `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
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
