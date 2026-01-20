/**
 * Bytes ↔ KB / MB / GB tool
 * Converts between bytes and units
 */
const convertBytes = (
  value: number,
  fromUnit: string,
  toUnit: string
): number => {
  const units: Record<string, number> = {
    bytes: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  };

  const fromMultiplier = units[fromUnit.toLowerCase()] || 1;
  const toMultiplier = units[toUnit.toLowerCase()] || 1;

  return (value * fromMultiplier) / toMultiplier;
};

export const transform = (
  input: string,
  fromUnit: string = 'bytes',
  toUnit: string = 'kb'
): string => {
  const value = parseFloat(input.trim());
  if (isNaN(value)) {
    throw new Error('Invalid number');
  }

  const result = convertBytes(value, fromUnit, toUnit);
  return result.toFixed(2) + ' ' + toUnit.toUpperCase();
};

export const reverse = (input: string): string => {
  // Bytes conversion is not easily reversible, return original
  return input;
};

export const validate = (input: string): { valid: boolean; error?: string } => {
  const value = parseFloat(input.trim());
  if (isNaN(value)) {
    return { valid: false, error: 'Invalid number' };
  }
  return { valid: true };
};
