/**
 * Now → UTC / IST / Custom TZ tool
 * Converts current time to different timezones
 */
export const transform = (input: string, timezone: string = 'UTC'): string => {
  const now = new Date();

  try {
    // Format based on timezone
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone || 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };

    const formatter = new Intl.DateTimeFormat('en-US', options);
    return formatter.format(now);
  } catch (error) {
    // Fallback to UTC
    return now.toISOString();
  }
};

export const reverse = (input: string): string => {
  // Now converter is not reversible, return current time
  return new Date().toISOString();
};

export const validate = (input: string): { valid: boolean; error?: string } => {
  // Always valid
  return { valid: true };
};
