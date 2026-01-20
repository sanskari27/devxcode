/**
 * Format HTTP headers tool
 * Formats and prettifies HTTP headers
 */
export const transform = (input: string): string => {
  try {
    const lines = input.split(/\r?\n/);
    const formatted: any = {};

    lines.forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        formatted[key] = value;
      }
    });

    return JSON.stringify(formatted, null, 2);
  } catch (error) {
    throw new Error(
      `Header formatting failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const reverse = (input: string): string => {
  try {
    const parsed = JSON.parse(input);
    return Object.entries(parsed)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  } catch {
    return input;
  }
};

export const validate = (input: string): { valid: boolean; error?: string } => {
  return { valid: true };
};
