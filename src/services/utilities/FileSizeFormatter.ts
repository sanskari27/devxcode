/**
 * File size formatter tool
 * Formats file sizes
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const transform = (input: string): string => {
  const bytes = parseInt(input.trim(), 10);
  if (isNaN(bytes) || bytes < 0) {
    throw new Error('Invalid byte value');
  }
  return formatFileSize(bytes);
};

export const reverse = (input: string): string => {
  // File size formatting is not easily reversible, return original
  return input;
};

export const validate = (input: string): { valid: boolean; error?: string } => {
  const bytes = parseInt(input.trim(), 10);
  if (isNaN(bytes) || bytes < 0) {
    return { valid: false, error: 'Invalid byte value' };
  }
  return { valid: true };
};
