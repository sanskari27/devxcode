/**
 * Random string generator tool
 * Generates random strings
 */
const generateRandomString = (
  length: number = 16,
  includeSpecial: boolean = false
): string => {
  const chars = includeSpecial
    ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const transform = (
  input: string,
  length: number = 16,
  includeSpecial: boolean = false
): string => {
  // If input is a number, use it as length
  const parsedLength = parseInt(input, 10);
  const actualLength = !isNaN(parsedLength) ? parsedLength : length;
  return generateRandomString(actualLength, includeSpecial);
};

export const reverse = (input: string): string => {
  // Random string generation is not reversible, generate new one
  return generateRandomString(16, false);
};

export const validate = (input: string): { valid: boolean; error?: string } => {
  return { valid: true };
};
