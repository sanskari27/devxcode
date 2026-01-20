/**
 * UUID v4 generator tool
 * Generates UUID v4
 */
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const transform = (input: string): string => {
  // Generate new UUID regardless of input
  return generateUUID();
};

export const reverse = (input: string): string => {
  // UUID generation is not reversible, generate new one
  return generateUUID();
};

export const validate = (input: string): { valid: boolean; error?: string } => {
  // Validate UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (input.trim() && !uuidRegex.test(input.trim())) {
    return { valid: false, error: 'Invalid UUID format' };
  }
  return { valid: true };
};
