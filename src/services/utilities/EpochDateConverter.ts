/**
 * Epoch ↔ Date Converter tool
 * Converts between Unix timestamp and readable date
 */
export const transform = (input: string, toDate: boolean = true): string => {
  try {
    const trimmed = input.trim();

    if (toDate) {
      // Convert epoch to date
      const epoch = parseInt(trimmed, 10);
      if (isNaN(epoch)) {
        throw new Error('Invalid epoch timestamp');
      }

      // Handle both seconds and milliseconds
      const date =
        epoch < 10000000000 ? new Date(epoch * 1000) : new Date(epoch);

      return date.toISOString();
    } else {
      // Convert date to epoch
      const date = new Date(trimmed);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date string');
      }
      return Math.floor(date.getTime() / 1000).toString();
    }
  } catch (error) {
    throw new Error(
      `Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const reverse = (input: string): string => {
  try {
    const trimmed = input.trim();

    // Try to parse as epoch first
    const epoch = parseInt(trimmed, 10);
    if (!isNaN(epoch)) {
      // It's an epoch, convert to date
      const date =
        epoch < 10000000000 ? new Date(epoch * 1000) : new Date(epoch);
      return date.toISOString();
    } else {
      // Try to parse as date
      const date = new Date(trimmed);
      if (!isNaN(date.getTime())) {
        // It's a date, convert to epoch
        return Math.floor(date.getTime() / 1000).toString();
      }
      throw new Error('Invalid input');
    }
  } catch (error) {
    throw new Error(
      `Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const validate = (input: string): { valid: boolean; error?: string } => {
  const trimmed = input.trim();
  const epoch = parseInt(trimmed, 10);

  if (!isNaN(epoch)) {
    return { valid: true };
  }

  const date = new Date(trimmed);
  if (!isNaN(date.getTime())) {
    return { valid: true };
  }

  return { valid: false, error: 'Invalid epoch or date' };
};
