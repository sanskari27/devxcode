/**
 * Human text → cron tool
 * Converts human text to cron expression (basic)
 */
export const transform = (input: string): string => {
  // This is a simplified version. Full implementation would need NLP
  const lower = input.toLowerCase();

  // Common patterns
  if (lower.includes('every minute') || lower.includes('every min')) {
    return '* * * * *';
  }
  if (lower.includes('every hour')) {
    return '0 * * * *';
  }
  if (lower.includes('every day') || lower.includes('daily')) {
    return '0 0 * * *';
  }
  if (lower.includes('every week') || lower.includes('weekly')) {
    return '0 0 * * 0';
  }
  if (lower.includes('every month') || lower.includes('monthly')) {
    return '0 0 1 * *';
  }

  // Default: every minute
  return '* * * * *';
};

export const reverse = (input: string): string => {
  // Human to cron is not reversible, return original
  return input;
};

export const validate = (input: string): { valid: boolean; error?: string } => {
  // Always valid for human text
  return { valid: true };
};
