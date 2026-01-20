/**
 * JavaScript to JSON object tool
 * Converts JavaScript object literal to JSON
 */
export const transform = (input: string): string => {
  try {
    // Remove comments (single and multi-line)
    const cleaned = input
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* ... */ comments
      .replace(/\/\/.*$/gm, '') // Remove // comments
      .trim();

    // Try to evaluate as JavaScript (in a safe way)
    // Note: This is a simplified version. Full implementation might need a proper parser
    const func = new Function(`return ${cleaned}`);
    const result = func();

    return JSON.stringify(result, null, 2);
  } catch (error) {
    throw new Error(
      `Invalid JavaScript object: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const reverse = (input: string): string => {
  try {
    const parsed = JSON.parse(input);
    // Convert JSON back to JavaScript object literal
    return JSON.stringify(parsed, null, 2).replace(/"/g, "'");
  } catch (error) {
    throw new Error(
      `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const validate = (input: string): { valid: boolean; error?: string } => {
  try {
    const cleaned = input
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .trim();
    new Function(`return ${cleaned}`);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error:
        error instanceof Error ? error.message : 'Invalid JavaScript object',
    };
  }
};
