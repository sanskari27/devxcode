/**
 * Remove newlines tool
 * Removes all newline characters
 */
export const transform = (input: string): string => {
  return input.replace(/\r?\n/g, ' ');
};

export const reverse = (input: string): string => {
  // Removing newlines is not reversible, return original
  return input;
};

export const validate = (input: string): { valid: boolean; error?: string } => {
  return { valid: true };
};
