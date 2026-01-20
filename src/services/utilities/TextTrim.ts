/**
 * Trim whitespace tool
 * Removes leading and trailing whitespace
 */
export const transform = (input: string): string => {
  return input.trim();
};

export const reverse = (input: string): string => {
  // Trim is not reversible, return original
  return input;
};

export const validate = (input: string): { valid: boolean; error?: string } => {
  return { valid: true };
};
