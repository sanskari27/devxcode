/**
 * Cron expression → human text tool
 * Converts cron expression to human readable
 */
const parseCronField = (field: string, index: number): string => {
  const fieldNames = [
    ['minute', 'minutes'],
    ['hour', 'hours'],
    ['day of month', 'days'],
    ['month', 'months'],
    ['day of week', 'days'],
  ];

  if (field === '*') {
    return `every ${fieldNames[index][0]}`;
  }

  if (field.includes('/')) {
    const [range, step] = field.split('/');
    if (range === '*') {
      return `every ${step} ${fieldNames[index][1]}`;
    }
    return `every ${step} ${fieldNames[index][1]} from ${range}`;
  }

  if (field.includes('-')) {
    const [start, end] = field.split('-');
    return `from ${start} to ${end} ${fieldNames[index][1]}`;
  }

  if (field.includes(',')) {
    return `on ${field.replace(/,/g, ', ')} ${fieldNames[index][1]}`;
  }

  return `on ${field} ${fieldNames[index][0]}`;
};

export const transform = (input: string): string => {
  try {
    const parts = input.trim().split(/\s+/);
    if (parts.length !== 5) {
      throw new Error('Cron expression must have 5 fields');
    }

    const descriptions = parts.map((part, index) =>
      parseCronField(part, index)
    );
    return descriptions.join(', ');
  } catch (error) {
    throw new Error(
      `Cron parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const reverse = (input: string): string => {
  // Cron to human is not reversible, return original
  return input;
};

export const validate = (input: string): { valid: boolean; error?: string } => {
  try {
    const parts = input.trim().split(/\s+/);
    if (parts.length !== 5) {
      return { valid: false, error: 'Cron expression must have 5 fields' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid cron expression' };
  }
};
