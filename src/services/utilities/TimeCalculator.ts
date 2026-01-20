/**
 * Add / subtract time tool
 * Calculates time with offsets (e.g., now + 2h 15m)
 */
const parseTimeOffset = (input: string): number => {
  // Parse patterns like "2h 15m", "+1d", "-30m", etc.
  const cleaned = input.trim().replace(/^\+/, '');
  let totalMs = 0;

  // Match patterns: number + unit (h, m, s, d)
  const patterns = [
    { regex: /(\d+)d/gi, multiplier: 24 * 60 * 60 * 1000 },
    { regex: /(\d+)h/gi, multiplier: 60 * 60 * 1000 },
    { regex: /(\d+)m/gi, multiplier: 60 * 1000 },
    { regex: /(\d+)s/gi, multiplier: 1000 },
  ];

  patterns.forEach(({ regex, multiplier }) => {
    const matches = cleaned.matchAll(regex);
    for (const match of matches) {
      totalMs += parseInt(match[1], 10) * multiplier;
    }
  });

  return totalMs;
};

export const transform = (input: string, baseTime?: string): string => {
  try {
    const base = baseTime ? new Date(baseTime) : new Date();
    const offset = parseTimeOffset(input);
    const result = new Date(base.getTime() + offset);
    return result.toISOString();
  } catch (error) {
    throw new Error(
      `Time calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const reverse = (input: string): string => {
  // Time calculator is not easily reversible, return original
  return input;
};

export const validate = (input: string): { valid: boolean; error?: string } => {
  try {
    parseTimeOffset(input);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid time offset format' };
  }
};
